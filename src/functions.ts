import { findAllBrackets, removeBrackets } from "./lib/utils";
import { Command } from "./modules/command";
import { Program } from "./modules/program";
import {
  DefineCommandOptions,
  IOptions,
  IProgramConfig,
  RawArgs,
  VersionNumber,
} from "./types";

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

export function zors(
  name: string,
  version?: VersionNumber,
  config?: Omit<IProgramConfig, "tools"> & { tools?: Record<string, any> }
): Program {
  return new Program(name, version, config);
}
