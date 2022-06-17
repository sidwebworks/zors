import colors from 'ansi-colors';
import { Command } from '../command';

export interface ILogger {
  debug: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  success: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  log: (...args: unknown[]) => void;
  start: (name: string) => void;
  stop: (name: string) => void;
}

export interface ParsedArgs {
  /** Contains all the arguments that didn't have an option associated with
   * them. */
  _: Array<string | number>;
  // deno-lint-ignore no-explicit-any
  [key: string]: any;
}

export interface ParseOptions {
  /** When `true`, populate the result `_` with everything before the `--` and
   * Defaults to `false`.
   */
  '--'?: boolean;

  /** An object mapping string names to strings or arrays of string argument
   * names to use as aliases. */
  alias?: Record<string, string | string[]>;

  /** A boolean, string or array of strings to always treat as booleans. If
   * `true` will treat all double hyphenated arguments without equal signs as
   * `boolean` (e.g. affects `--foo`, not `-f` or `--foo=bar`) */
  boolean?: boolean | string | string[];

  /** An object mapping string argument names to default values. */
  default?: Record<string, unknown>;

  /** When `true`, populate the result `_` with everything after the first
   * non-option. */
  stopEarly?: boolean;

  /** A string or array of strings argument names to always treat as strings. */
  string?: string | string[];

  /** A string or array of strings argument names to always treat as arrays.
   * Collectable options can be used multiple times. All values will be
   * colelcted into one array. If a non-collectable option is used multiple
   * times, the last value is used. */
  collect?: string | string[];

  /** A string or array of strings argument names which can be negated
   * by prefixing them with `--no-`, like `--no-config`. */
  negatable?: string | string[];

  /** A function which is invoked with a command line parameter not defined in
   * the `options` configuration object. If the function returns `false`, the
   * unknown option is not added to `parsedArgs`. */
  unknown?: (arg: string, key?: string, value?: unknown) => unknown;
}

export type Tools = { logger: ILogger; colors: typeof colors };

export interface CommandConfig {
  allowUnknownOptions?: boolean;
  ignoreOptionDefaultValue?: boolean;
}

export interface DefineCommandOpts<
  T extends any[],
  O extends Record<string, string | number>
> extends CommandConfig {
  description?: string;
  version?: string;
  options?: { name: string; description: string; config?: OptionConfig }[];
  alias?: string[];
  args?: CommandArg[];
  action?: Action<T, O>;
  examples?: CommandExample[];
}

export type HelpCallback = (sections: HelpSection[]) => void | HelpSection[];

export type CommandExample = ((bin: string) => string) | string;
export interface CommandArg {
  required: boolean;
  value: string;
  variadic: boolean;
}

export interface HelpSection {
  title?: string;
  body: string;
}

export type Action<
  A extends unknown[] = [],
  O extends Record<string, string | number> = {}
> = (this: Command<A, O>, args: A, opts: O, T: Tools) => Promise<void> | void;

export interface OptionConfig {
  default?: any;
  type?: any[];
}

export type ProgramEvents =
  | 'onBeforeRun'
  | 'onAfterRun'
  | 'onError'
  | 'onExit'
  | 'onRegister';

export interface ProgramConfig {
  parser?: ParseOptions;
  tools?: Tools;
  captureErrors?: boolean;
}
