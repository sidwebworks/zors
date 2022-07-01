import { ZorsError } from '../lib/error';
import { merge } from '../lib/utils';
import { IOptions, IProgramConfig, Tools, VersionNumber } from '../types';
import { CommandManager } from './command';
import { EventsManager } from './events';
import { PluginsManager } from './plugins';

const defaultOptions: IProgramConfig = {
  printHelpOnNotFound: true,
  captureErrors: false,
  concurrentBootstrap: false,
  formatters: {},
  parser: {},
  plugins: [],
  tools: {},
};

export class Program {
  private commands: CommandManager;
  private plugins: PluginsManager;
  private events: EventsManager;
  public tools: Tools = {};

  args: (string | number)[] = [];
  options: IOptions = {};

  constructor(
    public name: string,
    public versionNumber?: VersionNumber,
    public config: IProgramConfig = {}
  ) {
    this.config = merge(defaultOptions, config);

    // Create instances of Manager modules
    this.commands = new CommandManager(this);
    this.plugins = new PluginsManager(this);
    this.events = new EventsManager();

    // Do some intilization stuff
    this.tools = merge(this.tools, config?.tools);
    this.plugins.register(config?.plugins || []);

    if (versionNumber?.trim()) {
      this.version(versionNumber);
    }
  }

  version(value: VersionNumber, flags?: string) {
    this.commands.global.version(value, flags);
    return this;
  }

  help(flags = '-h, --help') {
    this.commands.global.option(flags, 'Display help output');
    return this;
  }

  get emit() {
    return this.events.emit;
  }

  get on() {
    return this.events.on;
  }

  get off() {
    return this.events.off;
  }

  get command() {
    return this.commands.add;
  }

  get register() {
    return this.commands.register;
  }

  get parse() {
    return this.commands.parse;
  }

  async run(argv: (string | string)[]) {
    await this.plugins.attach();

    const {
      args: [bin],
    } = this.parse(argv);

    const {
      args: [first, ...args],
      options,
    } = this.parse(argv, bin as string);

    this.args = args;
    this.options = options;

    // const none = !first && args.length === 0;

    const name = String(first);

    let found = this.commands.find(name);

    const global = this.commands.global;

    // if no command found, see if program implements a global command and use it
    if (global.isImplemented) {
      found = global;
    }

    // command is found and input has version flag, print its version
    if (found && options[found.keys.version]) {
      return found.getVersion();
    } else if (options[global.keys.version]) {
      // if no command print global command's version
      return global.getVersion();
    }

    // flags has `help` or no input args and command is provided
    // check and print the found command's help output
    if (found && options[found.keys.help]) {
      return found.printHelp();
    } else if (options[global.keys.help]) {
      // if no command and  print global command's version
      return global.printHelp();
    }

    if (!found) {
      // No command matches, emit the `unknown command` event and exit
      this.emit(`run:*`);

      if (this.config?.printHelpOnNotFound) {
        global.printHelp();
      }

      return this.emit('done');
    }

    // if any command is there, try to validate the input
    found.validate(args, options);

    // @ts-ignore
    this.emit(`run:${found.name}`);

    try {
      const ran = found.execute(args, options, this.tools);
      if (ran?.then) {
        await ran;
      }
    } catch (error) {
      // Re-throw if user wants to handle it manually
      this.handleError(error);
    }
    this.emit('done');
  }

  private handleError(error: unknown) {
    if (error instanceof ZorsError) {
      throw error;
    } else if (!this.config.captureErrors) {
      throw error;
    }
    this.emit('error');
  }
}
