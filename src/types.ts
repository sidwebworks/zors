import { Command } from "./managers/Command";
import picocolors from "picocolors";

export interface ParserFlags {
  bools: Record<string, boolean>;
  strings: Record<string, boolean>;
  collect: Record<string, boolean>;
  negatable: Record<string, boolean>;
  unknownFn: (arg: string, key?: string, value?: unknown) => unknown;
  allBools: boolean;
}

export interface Tools {}

export interface ParserResult {
  _: Array<string | number>;
  [key: string]: any;
}

export interface ParserOptions {
  "--"?: boolean;

  alias?: Record<string, string | string[]>;

  boolean?: boolean | string | string[];

  default?: Record<string, unknown>;

  stopEarly?: boolean;

  string?: string | string[];

  collect?: string | string[];

  negatable?: string | string[];

  unknown?: (arg: string, key?: string, value?: unknown) => unknown;
}

export interface NestedMapping {
  [key: string]: NestedMapping | unknown;
}

export interface IProgramConfig<T extends Tools = Tools> {
  parser?: ParserOptions;
  tools?: T;
}

export type RawArgs = (string | number | string[] | number[])[];

export type IOptions = Record<string, string | number>;

export interface Commands {}

export type ProgramEvents<P extends keyof Commands = keyof Commands> =
  | "register"
  | "error"
  | "beforeExit"
  | "beforeRun"
  | `run:${Commands[P]}`
  | `run:*`;

export interface IParsedArg {
  required: boolean;
  value: string;
  variadic: boolean;
}

export interface ICommandConfig {
  allowUnknownOptions?: boolean;
  ignoreOptionDefaultValue?: boolean;
}

export type VersionNumber = `${number}.${number}.${number}`;

export type DefaultTools = {
  colors: typeof picocolors;
};

export type Action<
  A extends RawArgs,
  O extends IOptions = IOptions,
  T extends Tools = Tools
> = (
  this: Command<A, O, T>,
  args: A,
  opts: O,
  tools: Omit<DefaultTools, keyof T> & T
) => Promise<void> | void;

export interface DefineCommandOptions<A extends RawArgs, O extends IOptions> {
  action: Action<A, O, Tools>;
  description: string;
  aliases?: string[];
  version?: VersionNumber;
  options?: {
    raw: string;
    description: string;
    opts?: { default?: any; type?: any[] };
  }[];
  config?: ICommandConfig;
}
