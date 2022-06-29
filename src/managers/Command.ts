import { ZorsError } from "../lib/error";
import { parse } from "../lib/parser";
import {
  camelcaseOptionName,
  findAllBrackets,
  noop,
  removeBrackets,
} from "../lib/utils";
import { Program } from "../Program";
import {
  Action,
  AllTools,
  CommandExample,
  DefineCommandOptions,
  ICommandConfig,
  IOptions,
  IParsedArg,
  ParserOptions,
  RawArgs,
  VersionNumber,
} from "../types";

/**
 * Creates a new instances of the command object
 */
export class Command<T extends RawArgs, O extends IOptions> {
  private root?: CommandManager;
  private _action?: Action<T, O>;
  private _version: VersionNumber = "0.0.0";
  private _usage: string = "";
  private examples: CommandExample[] = [];
  raw: string = "";
  aliases: string[] = [];
  args: IParsedArg[] = [];
  options: Option[] = [];
  config?: ICommandConfig;

  constructor(
    public name: string,
    public description: string,
    config?: ICommandConfig
  ) {
    this.config = Object.assign(
      {
        allowUnknownOptions: false,
        ignoreOptionDefaultValue: false,
      },
      config
    );
  }

  get isDefault() {
    return this.name === "" || this.aliases.includes("!");
  }

  get isGlobal(): boolean {
    return this.name === "@@Global@@";
  }

  version(value: VersionNumber, flags = "-v, --version") {
    this._version = value;
    this.option(flags, "Display version number");
    return this;
  }

  example(example: CommandExample) {
    this.examples.push(example);
    return this;
  }

  usage(text: string) {
    this._usage = text.trim();
    return this;
  }

  alias(name: string) {
    this.aliases.push(name);
    return this;
  }

  option(
    raw: string,
    description: string,
    config: { default?: any; type?: any[] } = {}
  ) {
    const item = new Option(raw, description, config);
    this.options.push(item);
    return this;
  }

  link(manager: CommandManager) {
    this.root = manager;
  }

  execute(args: T, options: O, tools: AllTools) {
    if (!this._action) {
      throw new ZorsError(`Command ${this.name} is not implemented.`);
    }

    this.validate(args, options);

    return this._action(args, options, tools);
  }

  hasOption(name: string) {
    const _name = name.split(".")[0];
    return this.options.find((opt) => opt.aliases.includes(_name));
  }

  validate(args: RawArgs, options: IOptions) {
    const required = this.args.filter((a) => a.required);

    if (!this.root) return;

    if (args.length < required.length) {
      throw new ZorsError(`Missing required arg for command \`${this.raw}\``);
    }

    if (!this.config?.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (
          name !== "--" &&
          !this.hasOption(name) &&
          !this.root.hasOption(name)
        ) {
          throw new ZorsError(
            `Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``
          );
        }
      }
    }
  }

  action(func: Action<T, O>): Program {
    this._action = func;
    return this.root?.program as Program;
  }

  printVersion() {
    if (!this.root) return;

    const { colors } = this.root.tools;

    const name = (
      this.isGlobal ? this.root.program.name : this.name
    ).toUpperCase();

    if (!colors.cyan || !colors.green || !colors.bold) {
      console.log(`${name}/${`v^${this._version}`}`);
    } else {
      console.log(
        colors.bold(
          `${colors.cyan(name)}/${colors.green(`v^${this._version}`)}`
        )
      );
    }
  }
}

/**
 * Creates a new instance of the command manager
 */
export class CommandManager extends Command<RawArgs, IOptions> {
  private commands: Map<string, Command<RawArgs, IOptions>> = new Map();
  tools: AllTools;

  constructor(public program: Program) {
    super("@@Global@@", "");
    this.link(this);
    this.tools = program.tools;
  }

  parse = (input: string[]) => {
    const { _: args, ...options } = parse(input, this.getParserOptions());

    return { args, options };
  };

  private getParserOptions(command?: Command<RawArgs, IOptions>) {
    const config: ParserOptions = {
      alias: {
        version: ["v"],
      },
      boolean: [],
    };

    const allOptions = [...this.options].concat(command?.options || []);

    for (const [index, option] of allOptions.entries()) {
      if (option.aliases.length > 0) {
        config.alias![option.aliases[0]] = option.aliases.slice();
      }

      if (option.isBoolean) {
        if (option.isNegated) {
          const hasStringTypeOption = allOptions.some((o, i) => {
            return (
              i !== index &&
              o.aliases.some((name) => option.aliases.includes(name)) &&
              typeof o.isRequired === "boolean"
            );
          });

          if (!hasStringTypeOption && Array.isArray(config.boolean)) {
            config.boolean.push(option.aliases[0]);
          }
        } else if (Array.isArray(config.boolean)) {
          config.boolean.push(option.aliases[0]);
        }
      }
    }

    for (let [name, command] of this.commands.entries()) {
      config.alias![name] = command.aliases;
    }

    return Object.assign({}, this.program.config?.parser, config);
  }

  register = (command: Command<any, any>) => {
    command.link(this);
    this.commands.set(command.name, command);
    this.program.emit("register");

    return this.program;
  };

  add = <A extends RawArgs = RawArgs, O extends IOptions = IOptions>(
    raw: string,
    description: string,
    config?: ICommandConfig
  ) => {
    const command = new Command<A, O>(removeBrackets(raw), description, config);

    command.args = findAllBrackets(raw);

    command.raw = raw;

    this.register(command);

    return command;
  };

  find = (query: string): CommandManager | Command<RawArgs, IOptions> => {
    for (let [name, command] of this.commands.entries()) {
      if (name === query) {
        return command;
      }

      if (command.aliases.includes(query)) {
        return command;
      }
    }

    return this;
  };
}

/**
 * Creates a new instance of option object
 */
export class Option {
  name: string;
  aliases: string[] = [];
  isBoolean: boolean = false;
  isRequired: boolean = false;
  isNegated: boolean = false;
  default?: any;
  type?: any[];

  constructor(
    public raw: string,
    public description: string,
    opts: { default?: any; type?: any[] }
  ) {
    const { type, default: defaultValue = null } = opts || {};

    this.default = defaultValue;
    this.type = type;

    this.raw = raw.replace(/\.\*/g, "");

    this.aliases = removeBrackets(raw)
      .split(",")
      .map((v: string) => {
        let name = v.trim().replace(/^-{1,2}/, "");

        if (name.startsWith("no-")) {
          this.isNegated = true;
          name = name.replace(/^no-/, "");
        }

        return camelcaseOptionName(name);
      })
      .sort((a, b) => (a.length > b.length ? 1 : -1));

    this.name = this.aliases[this.aliases.length - 1];

    if (this.isNegated && this.default == null) {
      this.default = true;
    }

    if (raw.includes("<")) {
      this.isRequired = true;
    } else if (raw.includes("[")) {
      this.isRequired = false;
    } else {
      this.isBoolean = true;
    }
  }
}

/**
 * A fascade function to create a new instance of Command
 */
export function defineCommand<
  A extends RawArgs = RawArgs,
  O extends IOptions = IOptions
>(raw: string, opts: DefineCommandOptions<A, O>) {
  const command = new Command<A, O>(
    removeBrackets(raw),
    opts.description,
    opts.config
  );

  command.raw = raw;

  command.args = findAllBrackets(raw);

  command.aliases = opts.aliases || [];

  opts.options?.forEach((el) =>
    command.option(el.raw, el.description, el.opts)
  );

  opts.examples?.forEach((el) => command.example(el));

  command.action(opts.action);

  return command;
}
