import { findAllBrackets, removeBrackets } from './lib/utils';
import { Command } from './modules/command';
import { Program } from './modules/program';
import {
  Commands,
  DefineCommandOptions,
  IOptions,
  IProgramConfig,
  RawArgs,
  VersionNumber,
} from './types';

/**
 * A fascade function to create a new instance of Command
 */
export function defineCommand<
  A extends RawArgs = RawArgs,
  O extends IOptions = IOptions
>(raw: string, options: DefineCommandOptions<A, O>) {
  const command = new Command<A, O>(
    removeBrackets(raw as string),
    options.description,
    options.config
  );

  command.raw = raw;

  command.version(options.version?.value, options.version?.flags);

  command.help();

  command.args = findAllBrackets(raw as string);

  options.aliases?.forEach((al) => command.alias(al));

  options.options?.forEach((el) =>
    command.option(el.raw, el.description, {
      default: el.default,
    })
  );

  command.usage(options.usage || '');

  options.examples?.forEach((el) => command.example(el));

  command.action(options.action);

  return command;
}

/**
 * Creates a new Program
 * @param name Name of the CLI program
 * @param version Version number (SEMVER)
 * @param config
 * @returns
 */
export function zors(
  name: string,
  version?: VersionNumber,
  config?: Omit<IProgramConfig, 'tools'> & { tools?: Record<string, any> }
): Program {
  return new Program(name, version, config);
}
