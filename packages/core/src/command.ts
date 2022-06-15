interface CommandOptions {
  /** The name of your command */
  name: string;
  /** A small description of your command */
  description: string;
  /** Should your command be shown in the listings  */
  hide?: boolean;
  /** Potential other names for this command */
  alias?: string | string[];
  /** function which gets called for this command */
  run: (
    args: (string | number)[],
    options: Record<string, string | number>
  ) => Promise<void> | void;
}

export interface Command extends CommandOptions {
  alias: string[];
}

export function defineCommand({
  alias = [],
  ...options
}: CommandOptions): Command {
  return {
    name: options.name,
    alias: Array.isArray(alias) ? alias : [alias],
    description: options.description,
    hide: options.hide || false,
    run: options.run,
  };
}
