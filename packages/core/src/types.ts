import { Command } from './modules/command';
import { Program } from './modules/program';

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
  /** When `true`, populate the result `_` with everything before the `--` and
   * the result `['--']` with everything after the `--`. Here's an example:
   * Defaults to `false`.
   */
  "--"?: boolean;

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

export interface NestedMapping {
  [key: string]: NestedMapping | unknown;
}

export interface IProgramConfig {
  /**
   * Configuration options to pass onto the underlying parser
   */
  parser?: ParserOptions;
  /**
   * Array of plugins to register in the program
   */
  plugins?: IPlugin[];
  /**
   * Custom tools which are accessible anywhere inside the program and command actions.
   */
  tools?: Partial<Tools>;
  /**
   * Formatter hooks to register and provide custom formatting for `version` and `help` outputs
   */
  formatters?: {
    version?: (
      this: Required<IProgramConfig>,
      version: VersionNumber,
      name: string
    ) => string;
    help?: (
      this: Required<IProgramConfig>,
      sections: HelpSection[]
    ) => HelpSection[];
  };
  /**
   * Should print help output if no commands are found
   * @default true
   */
  printHelpOnNotFound?: boolean;
  /**
   * Should capture any unhandled errors raised inside the program other than `ZorsError`
   * @default false
   */
  captureErrors?: boolean;
  /**
   * Enable concurrent initialization for bootstrapping plugins, if your plugins depend on each other,
   * we suggest keeping disabling this, as it won't run your plugins sequentially.
   * @default false 
   */
  concurrentBootstrap?: boolean;
}

export type RawArgs = (string | number | string[] | number[])[] | undefined;

export type IOptions = Record<string, string | number | boolean>;

type Letter =
  | 'a'
  | 'b'
  | 'c'
  | 'd'
  | 'e'
  | 'f'
  | 'g'
  | 'h'
  | 'i'
  | 'j'
  | 'k'
  | 'l'
  | 'm'
  | 'n'
  | 'o'
  | 'p'
  | 'q'
  | 'r'
  | 's'
  | 't'
  | 'u'
  | 'v'
  | 'w'
  | 'x'
  | 'y'
  | 'z';

type FirstLetterOf<S extends string> = string extends S
  ? string // case where S is just string, not a literal type
  : {
      [L in Letter]: S extends `${L}${string}` ? L : never;
    }[Letter];

type LooseAutoComplete<T extends string> = T | Omit<string, T>;

export type ParsingScopes = LooseAutoComplete<'*' | 'global'>;

export type TypedRawOption<T extends string | number | symbol> =
  T extends string
    ? LooseAutoComplete<
        `--${T}` | `-${FirstLetterOf<T>}` | `-${FirstLetterOf<T>}, --${T}`
      >
    : string;

export interface Commands {}

export type ProgramEvents =
  | 'register'
  | 'error'
  | 'done'
  | `run:${keyof Commands}`
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

export type Action<A extends RawArgs, O extends IOptions = IOptions> = (
  this: Command<A, O>,
  args: A,
  opts: O,
  tools: Tools
) => Promise<void> | void;

export interface DefineCommandOptions<A extends RawArgs, O extends IOptions> {
  action: Action<A, O>;
  description: string;
  usage?: string;
  aliases?: string[];
  version?: { value?: VersionNumber; flags?: string };
  examples?: CommandExample[];
  options?: {
    raw: TypedRawOption<keyof O>;
    description: string;
    default?: any;
  }[];
  config?: ICommandConfig;
}

export type EventType = string | symbol;

export type EventsMap<E extends Record<EventType, unknown>> = Map<
  keyof E,
  Listener[]
>;

export type Listener = () => void;

export interface IPlugin {
  name: string;
  build: (program: Program) => Program | Promise<Program>;
}

export interface HelpSection {
  title?: string;
  body: string;
}

export type CommandExample = ((bin: string) => string) | string;
