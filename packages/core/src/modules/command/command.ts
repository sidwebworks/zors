import { CommandManager } from '.';
import { ZorsError } from '../../lib/error';
import { findLongest, padRight } from '../../lib/utils';
import {
  Action,
  CommandExample,
  HelpSection,
  ICommandConfig,
  IOptions,
  IParsedArg,
  IProgramConfig,
  RawArgs,
  Tools,
  TypedRawOption,
  VersionNumber,
} from '../../types';
import { Program } from '../program';
import { Option } from './option';

const defaulOptions = {
  allowUnknownOptions: false,
  ignoreOptionDefaultValue: false,
};

/**
 * Creates a new instances of the command object
 */
export class Command<T extends RawArgs, O extends IOptions> {
  private manager?: CommandManager;
  private _action?: Action<T, O>;
  private examples: CommandExample[] = [];
  raw: string = '';
  _version: VersionNumber = '0.0.0';
  _usage: string = '';
  aliases: string[] = [];
  args: IParsedArg[] = [];
  options: Option[] = [];
  config?: ICommandConfig;

  constructor(
    public name: string,
    public description: string,
    config?: ICommandConfig
  ) {
    this.config = Object.assign(defaulOptions, config);
  }

  get isDefault() {
    return this.name === '' || this.aliases.includes('!');
  }

  get isGlobal(): boolean {
    return this.name === this.manager?.program.name;
  }

  get isImplemented(): boolean {
    return typeof this._action === 'function';
  }

  version(value: VersionNumber, flags = '-v, --version') {
    this._version = value;
    this.option(flags as TypedRawOption<keyof O>, 'Display version number');
    return this;
  }

  default() {
    this.aliases.push('!');
    return this;
  }

  example(example: CommandExample) {
    this.examples.push(example);
    return this;
  }

  usage(text: string) {
    this._usage = text.trim();
    return this;
  }

  alias(name: string) {
    this.aliases.push(name);
    return this;
  }

  option(
    raw: TypedRawOption<keyof O>,
    description: string,
    config: { default?: any; type?: any[] } = {}
  ) {
    // @ts-ignore
    const item = new Option(raw, description, config);
    this.options.push(item);
    return this;
  }

  link(manager: CommandManager) {
    this.manager = manager;
  }

  execute(args: T, options: O, tools: Tools) {
    if (!this.isImplemented) {
      throw new ZorsError(`Command ${this.name} is not implemented.`);
    }

    return this._action!(args, options, tools);
  }

  hasOption(name: string) {
    const _name = name.split('.')[0];
    return this.options.find((opt) => opt.aliases.includes(_name));
  }

  validate(args: RawArgs, parsedOptions: IOptions) {
    const required = this.args.filter((a) => a.required);

    if (!this.manager) return;

    const options = [...this.manager.global.options, ...this.options];

    if (args!.length < required.length) {
      throw new ZorsError(`Missing required arg for command \`${this.raw}\``);
    }

    if (!this.config?.allowUnknownOptions) {
      for (const { name } of options) {
        if (
          name !== '--' &&
          !this.hasOption(name) &&
          !this.manager.global.hasOption(name)
        ) {
          throw new ZorsError(
            `Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``
          );
        }
      }
    }

    for (const option of options) {
      const value = parsedOptions[option.name.split('.')[0]];

      // Check required option value
      if (option.isRequired) {
        const hasNegated = options.some(
          (o) => o.isNegated && o.aliases.includes(option.name)
        );

        if (
          value === true ||
          (value === false && !hasNegated) ||
          value === undefined
        ) {
          throw new ZorsError(`option \`${option.raw}\` value is missing`);
        }
      }
    }
  }

  action(func: Action<T, O>): Program {
    this._action = func;
    return this.manager?.program as Program;
  }

  getVersion(print = true) {
    if (!this.manager) return;

    const name = (
      this.isGlobal || this.isDefault ? this.manager.program.name : this.name
    ).toUpperCase();

    const config = Object.assign({}, this.manager.program.config!, {
      tools: this.manager.tools,
    });

    const customFormatter = config?.formatters?.version;

    let msg;

    if (customFormatter) {
      msg = customFormatter.apply(config as Required<IProgramConfig>, [
        this._version,
        name,
      ]);
    } else {
      msg = `${name}/${`v${this._version}`}`;
    }

    if (print) {
      console.log(msg);
    }

    return msg;
  }

  printHelp() {
    const commands = this.manager!.all;
    const config = this.manager?.program.config as Required<IProgramConfig>;
    const formatters = config?.formatters;

    const global = this.manager!.global;

    const version = this.getVersion(false) || `${this.name}/v${this._version}`;

    let sections: HelpSection[] = [{ body: version }];

    sections.push({
      title: 'Usage',
      body: `  $ ${global.name} ${this._usage || this.raw}`,
    });

    const hasCommands = commands.length > 0;

    const show = (global.isGlobal || global.isDefault) && hasCommands;

    if (show) {
      const longest = findLongest(commands.map((c) => c.raw));

      sections.push({
        title: 'Commands',
        body: commands
          .map((c) => `  ${padRight(c.raw, longest.length)}  ${c.description}`)
          .join('\n'),
      });

      sections.push({
        title: `For more info, run any command with the \`--help\` flag`,
        body: commands
          .map(
            (c) =>
              `  $ ${global.name}${c.name === '' ? '' : ` ${c.name}`} --help`
          )
          .join('\n'),
      });
    }

    let options = this.isGlobal
      ? global.options
      : [...this.options, ...(global.options || [])];

    if (!this.isGlobal && !this.isDefault) {
      options = options.filter((option) => option.name !== 'version');
    }

    if (options.length > 0) {
      const longest = findLongest(options.map((option) => option.raw));

      sections.push({
        title: 'Options',
        body: options
          .map((o) => {
            return `  ${padRight(o.raw, longest.length)}  ${o.description} ${
              !o.default ? '' : `(default: ${o.default})`
            }`;
          })
          .join('\n'),
      });
    }

    if (this.examples.length > 0) {
      sections.push({
        title: 'Examples',
        body: this.examples
          .map((example) => {
            if (typeof example === 'function') {
              return example(this.name);
            }
            return `  $ ${global.name ? `${global.name} ` : ''}${example}`;
          })
          .join('\n'),
      });
    }

    if (formatters?.help) {
      sections =
        formatters.help.apply(config as Required<IProgramConfig>, [sections]) ||
        sections;
    }

    console.log(
      sections
        .map((section) =>
          section.title ? `${section.title}:\n${section.body}` : section.body
        )
        .join('\n\n')
    );
  }
}
