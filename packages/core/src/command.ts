import colors from "ansi-colors";
import { ZorsError } from "./lib/error";
import { findAllBrackets, removeBrackets } from "./lib/utils";
import { Option, OptionConfig } from "./option";
import { Program } from "./program";
import { ILogger, Tools } from "./types";

interface CommandArg {
  required: boolean;
  value: string;
  variadic: boolean;
}

interface HelpSection {
  title?: string;
  body: string;
}

interface CommandConfig {
  allowUnknownOptions?: boolean;
  ignoreOptionDefaultValue?: boolean;
}

type HelpCallback = (sections: HelpSection[]) => void | HelpSection[];

type CommandExample = ((bin: string) => string) | string;

type Action<
  A extends unknown[] = [],
  O extends Record<string, string | number> = {}
> = (args: A, opts: O, T: Tools) => Promise<void> | void;

export class Command<
  T extends any[] = any[],
  O extends Record<string, string | number> = {}
> {
  aliases: string[];
  program?: Program;
  args: CommandArg[];
  options: Option[];
  private _action?: Action<T, O>;
  private _examples: CommandExample[];
  private _usage: string;
  protected root?: RootCommand;

  constructor(
    public name: string,
    public raw: string,
    public description: string,
    public config: CommandConfig = {}
  ) {
    this.options = [];
    this._usage = "";
    this.args = [];
    this.aliases = [];
    this._examples = [];
  }

  alias(names: string[]) {
    this.aliases.push(...names);
  }

  action(act: Action<T, O>) {
    this._action = act;
    return this.program!;
  }

  execute(args: T, options: O, tools: Tools) {
    if (!this._action) {
      throw new ZorsError(`Command ${this.name} is not implemented.`);
    }

    return this._action(args, options, tools);
  }

  option(rawName: string, description: string, config?: OptionConfig) {
    const option = new Option(rawName, description, config);
    this.options.push(option);
    return this;
  }

  get isDefaultCommand() {
    return this.name === "" || this.aliases.includes("!");
  }

  get isRootCommand(): boolean {
    return this instanceof RootCommand;
  }

  usage(text: string) {
    this._usage = text;
    return this;
  }

  match(name: string) {
    return this.name === name || this.aliases.includes(name);
  }

  hasOption(name: string) {
    const _name = name.split(".")[0];
    return this.options.find((opt) => opt.names.includes(_name));
  }

  register(program: Program) {
    this.program = program;
    this.root = program.root;
    this.program.emit("onRegister", program);

    return this;
  }
}

export class RootCommand extends Command {
  constructor(program: Program) {
    super("@@ROOT@@", "@@ROOT@@", "", {});
    this.program = program;
    this.root = program.root;
    this.usage("<command> [options]");
  }
}

interface DefineCommandOpts<
  T extends any[],
  O extends Record<string, string | number>
> extends CommandConfig {
  description?: string;
  options?: { name: string; description: string; config?: OptionConfig }[];
  alias?: string[];
  args?: CommandArg[];
  action?: Action<T, O>;
  examples?: CommandExample[];
}

export function defineCommand<
  TArgs extends any[] = any[],
  TOpts extends Record<string, any> = {}
>(raw: string, opts?: DefineCommandOpts<TArgs, TOpts>) {
  const {
    action,
    examples,
    description = "",
    args = [],
    alias = [],
    options = [],
    ...config
  } = opts || {};

  const name = removeBrackets(raw);

  const allArgs = [...new Set(findAllBrackets(raw).concat(args))];

  const command = new Command<TArgs, TOpts>(name, raw, description, config);

  command.alias(alias);

  command.args = allArgs;

  command.options = options.map(
    (o) => new Option(o.name, o.description, o.config)
  );

  if (action) {
    command.action(action);
  }

  return command;
}
