import { ZorsError } from '../lib/error';
import {
  IOptions,
  IParsedArg,
  IProgramConfig,
  RawArgs,
  Tools,
  VersionNumber,
} from '../types';
import { CommandManager } from './command';
import { EventsManager } from './events';
import { PluginsManager } from './plugins';

export class Program {
  private commands: CommandManager;
  private plugins: PluginsManager;
  private events: EventsManager<Program>;
  public tools: Tools = {};
  args: (string | number)[] = [];
  options: IOptions = {};

  constructor(
    public name: string,
    public versionNumber?: VersionNumber,
    public config: IProgramConfig = {
      printHelpOnNotFound: true,
      captureErrors: true,
    }
  ) {
    // Create instances of Manager modules
    this.commands = new CommandManager(this);
    this.plugins = new PluginsManager(this);
    this.events = new EventsManager<Program>();

    // Do some intilization stuff
    this.tools = Object.assign(this.tools, config?.tools);
    this.plugins.register(config?.plugins || []).attach();

    if (versionNumber?.trim()) {
      this.version(versionNumber);
    }
  }

  version(value: VersionNumber) {
    this.commands.global.version(value);
    return this;
  }

  help() {
    this.commands.global.option('-h, --help', 'Display help output');
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

  parse(input: (string | string)[]) {
    const { args, options } = this.commands.parse(input);
    this.args = args;
    this.options = options;

    return { args, options };
  }

  async run(argv: (string | string)[]) {
    this.emit('beforeRun');

    const {
      args: [first, ...args],
      options,
    } = this.parse(argv);

    const name = String(first);

    let found = this.commands.find(name);

    const none = !first && args.length === 0;

    // if no command found, see if program implements a global command and use it
    if (!found && this.commands.global.isImplemented) {
      found = this.commands.global;
    }

    // if any command is there, try to validate the input
    found?.validate(args, options);

    // command is found and input has version flag, print its version
    if (found && options['version']) {
      found.getVersion();
    } else if (options['version'] && none) {
      // if no command and  print global command's version
      return this.commands.global.getVersion();
    }

    // flags has `help` or no input args and command is provided
    // check and print the found command's help output
    if ((options['help'] || none) && this.commands.global.hasOption('help')) {
      if (!found && this.config?.printHelpOnNotFound) {
        return this.commands.global.printHelp();
      }

      return found?.printHelp(found.raw);
    }

    if (!found) {
      // No command matches, emit the `unknown command` event and exit
      this.emit(`run:*`);
      return this.emit('afterRun');
    }

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

    this.emit('afterRun');
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
