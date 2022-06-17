import colors from 'ansi-colors';
import { Command, RootCommand } from './command';
import { Emitter } from './lib/emitter';
import { ZorsError } from './lib/error';
import { Logger } from './lib/logger';
import { parse } from './lib/parser';
import { findAllBrackets, removeBrackets } from './lib/utils';
import { Option } from './option';
import {
  CommandConfig,
  ParseOptions,
  ProgramConfig,
  ProgramEvents,
  Tools,
} from './types';
import { isCommand } from './types/guards';

const defaultConfig: ProgramConfig = {
  parser: {},
  tools: { logger: Logger(), colors },
  captureErrors: false,
};

export class Program extends Emitter<Record<ProgramEvents, Program>> {
  commands: Command<any, any>[];
  tools: Tools;
  raw: string[];
  args: (string | number)[];
  options: Record<string, any>;
  root: Command;
  private importQueue: Promise<{ default: Command<any, any> }>[] = [];

  /**
   * @param name Program name to display in help and version
   */
  constructor(public name: string = '', public config: ProgramConfig = {}) {
    super();
    this.args = [];
    this.raw = [];
    this.commands = [];
    this.options = {};
    this.config = Object.assign(defaultConfig, config);
    this.tools = this.config.tools!;
    this.root = new RootCommand(this);
  }

  usage(text: string) {
    this.root.usage(text);
    return this;
  }

  command<A extends any[] = any[], O extends Record<string, any> = {}>(
    raw: string,
    description: string,
    config?: CommandConfig
  ) {
    const command = new Command<A, O>(
      removeBrackets(raw),
      raw,
      description,
      config
    );

    command.args = findAllBrackets(raw);

    this.commands.push(command);

    command.register(this);

    return command;
  }

  addCommand<T extends Command<any, any>>(maybeCommand: T | string) {
    if (isCommand(maybeCommand)) {
      this.commands.push(maybeCommand);
      maybeCommand.register(this);
    }

    if (typeof maybeCommand === 'string') {
      this.importQueue.push(import(maybeCommand));
    }

    return this;
  }

  private getParserOptions(command?: Command<any, any>) {
    const config: ParseOptions = {
      alias: {
        version: ['v'],
      },
      boolean: [],
    };

    const allOptions = [...this.root.options].concat(command?.options || []);

    for (const [index, option] of allOptions.entries()) {
      if (option.names.length > 0) {
        config.alias![option.names[0]] = option.names.slice();
      }

      if (option.isBoolean) {
        if (option.negated) {
          const hasStringTypeOption = allOptions.some((o, i) => {
            return (
              i !== index &&
              o.names.some((name) => option.names.includes(name)) &&
              typeof o.required === 'boolean'
            );
          });

          if (!hasStringTypeOption && Array.isArray(config.boolean)) {
            config.boolean.push(option.names[0]);
          }
        } else if (Array.isArray(config.boolean)) {
          config.boolean.push(option.names[0]);
        }
      }
    }

    for (let command of this.commands) {
      config.alias![command.name] = command.aliases;
    }

    return Object.assign({}, this.config.parser, config);
  }

  parse(input: string[], opts?: ParseOptions) {
    const { _: args, ...options } = parse(input, opts);

    return { args, options };
  }

  async resolveCommandImports() {
    if (this.importQueue.length > 0) {
      const modules = await Promise.all(this.importQueue).catch((err) => {
        throw new ZorsError(`Failed to auto-import commands from ${err.url}`);
      });

      modules.forEach((m) => {
        this.commands.push(m.default);
        m.default.register(this);
        this.importQueue.pop();
      });
    }
  }

  async run(input: string[]) {
    try {
      this.emit('onBeforeRun', this);

      await this.resolveCommandImports();

      const parserOptions = this.getParserOptions();
      console.log('parserOptions: ', parserOptions);

      const {
        args: [name, ...args],
        options,
      } = this.parse(input, parserOptions);

      this.args = args;
      this.options = options;
      this.raw = input;

      const _name = String(name);

      const command = this.commands.find((c) => c.match(_name)) || this.root;

      if (command) {
        if (command.hasOption('version')) {
          return command.printVersion();
        }

        command.checkRequiredArgs();

        const _args = command.args.reduce<any[]>((acc, curr, index) => {
          if (curr.variadic) {
            acc.push(args.slice(index));
          } else {
            acc.push(args[index]);
          }
          return acc;
        }, []);

        await command.execute(_args, options, this.tools);
      }
    } catch (err: any) {
      this.emit('onError', { error: err, program: this });
      if (!this.config.captureErrors) {
        throw err;
      }
    } finally {
      this.emit('onAfterRun', this);
    }
  }
}
