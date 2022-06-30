import { ZorsError } from '../../lib/error';
import { parse } from '../../lib/parser';
import { findAllBrackets, removeBrackets } from '../../lib/utils';
import {
  ICommandConfig,
  IOptions,
  ParserOptions,
  RawArgs,
  Tools,
} from '../../types';
import { Program } from '../program';
import { Command } from './command';

/**
 * Creates a new instance of the command manager
 */
export class CommandManager {
  private commands: Map<string, Command<RawArgs, IOptions>> = new Map();
  public global: Command<RawArgs, IOptions>;
  tools: Tools;

  constructor(public program: Program) {
    this.global = new Command(program.name, '');
    this.global.link(this);
    this.tools = program.tools;
  }

  get count() {
    return this.commands.size;
  }

  get all() {
    return Array.from(this.commands.values());
  }

  parse = (input: string[]) => {
    const { _: args, ...options } = parse(input, this.getParserOptions());

    return { args, options };
  };

  private getParserOptions() {
    const config: ParserOptions = {
      alias: {},
      default: {},
      boolean: [],
    };

    const allOptions = this.all.reduce(
      (acc, curr) => acc.concat(curr.options),
      [...this.global.options]
    );

    for (const [index, option] of allOptions.entries()) {
      if (option.aliases.length > 0) {
        config.alias![option.aliases.slice(-1)[0]] = option.aliases.slice();
      }

      if (option.default) {
        config.default![option.aliases.slice(-1)[0]] = option.default;
      }

      if (option.isBoolean) {
        if (option.isNegated) {
          const hasStringTypeOption = allOptions.some((o, i) => {
            return (
              i !== index &&
              o.aliases.some((name) => option.aliases.includes(name)) &&
              typeof o.isRequired === 'boolean'
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
    if (this.commands.has(command.name)) {
      throw new ZorsError(
        `A Command is already registered by the name \`${command.name}\``
      );
    }

    command.link(this);

    this.commands.set(command.name, command);

    this.program.emit('register');

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

  find = (query: string) => {
    for (let [name, command] of this.commands.entries()) {
      if (name === query) {
        return command;
      }

      if (command.aliases.includes(query)) {
        return command;
      }

      if (command.isDefault) {
        return command;
      }
    }
  };
}

export { Command };
