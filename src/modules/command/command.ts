import { CommandManager } from ".";
import { ZorsError } from "../../lib/error";
import {
  Action,
  AllTools,
  CommandExample,
  ICommandConfig,
  IOptions,
  IParsedArg,
  RawArgs,
  VersionNumber,
} from "../../types";
import { Program } from "../program";
import { Option } from "./option";

/**
 * Creates a new instances of the command object
 */
export class Command<T extends RawArgs, O extends IOptions> {
  private manager?: CommandManager;
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

  get isImplemented(): boolean {
    return typeof this._action === "function";
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
    this.manager = manager;
  }

  execute(args: T, options: O, tools: AllTools) {
    if (!this.isImplemented) {
      throw new ZorsError(`Command ${this.name} is not implemented.`);
    }

    this.validate(args, options);

    return this._action!(args, options, tools);
  }

  hasOption(name: string) {
    const _name = name.split(".")[0];
    return this.options.find((opt) => opt.aliases.includes(_name));
  }

  validate(args: RawArgs, options: IOptions) {
    const required = this.args.filter((a) => a.required);

    if (!this.manager) return;

    if (args.length < required.length) {
      throw new ZorsError(`Missing required arg for command \`${this.raw}\``);
    }

    if (!this.config?.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (
          name !== "--" &&
          !this.hasOption(name) &&
          !this.manager.global.hasOption(name)
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
    return this.manager?.program as Program;
  }

  printVersion() {
    if (!this.manager) return;

    const { colors } = this.manager.tools;

    const name = (
      this.isGlobal ? this.manager.program.name : this.name
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

  printHelp() {}
}
