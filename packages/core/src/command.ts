type Options<T extends any = unknown> = Record<string, T>;
type Args<T extends any = unknown> = T[];

interface CommandOptions<A extends Args = Args, O extends Options = Options> {
  /** The name of your command */
  name: string;
  /** A small description of your command */
  description: string;
  /** Should your command be shown in the listings  */
  hide?: boolean;
  /** Potential other names for this command */
  alias?: string | string[];
  /** function which gets called for this command */
  execute: (input: { args: A; options: O }) => Promise<void> | void;
}

export interface Command<A extends Args = Args, O extends Options = Options>
  extends CommandOptions<A, O> {
  alias: string[];
}

export function defineCommand<
  A extends Args = Args,
  O extends Options = Options
>({ alias = [], ...options }: CommandOptions<A, O>) {
  return {
    name: options.name,
    alias: Array.isArray(alias) ? alias : [alias],
    description: options.description,
    hide: options.hide || false,
    execute: options.execute,
  };
}
