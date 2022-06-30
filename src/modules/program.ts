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
    public config?: IProgramConfig
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

  get parse() {
    return this.commands.parse;
  }

  async run(argv: (string | string)[]) {
    this.emit('beforeRun');

    const {
      args: [first, ...args],
      options,
    } = this.commands.parse(argv);

    this.args = args;
    this.options = options;

    const name = String(first);

    let found = this.commands.find(name);

    const none = !first && args.length === 0;

    if (!found && this.commands.global.isImplemented) {
      found = this.commands.global;
    }

    found?.validate(args, options);

    if (found && options['v']) {
      found.getVersion();
    } else if (options['v']) {
      this.commands.global.getVersion();
    }

    if ((options['h'] || none) && this.commands.global.hasOption('help')) {
      if (!found) {
        return this.commands.global.printHelp();
      }

      return found.printHelp(found.raw);
    }

    if (!found) {
      this.emit(`run:*`);
      return this.emit('afterRun');
    }

    // @ts-ignore
    this.emit(`run:${found.name}`);

    await found.execute(args, options, this.tools);

    this.emit('afterRun');
  }
}
