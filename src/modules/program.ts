import { AllTools, IProgramConfig, VersionNumber } from "../types";
import { CommandManager } from "./command";
import { EventsManager } from "./events";
import { PluginsManager } from "./plugins";

export class Program {
  private commands: CommandManager;
  private plugins: PluginsManager;
  private events: EventsManager<Program>;
  public tools: AllTools = {};

  constructor(
    public name: string,
    version: VersionNumber = "0.0.0",
    public config: IProgramConfig
  ) {
    this.tools = Object.assign({}, this.tools, config?.tools);
    this.commands = new CommandManager(this);
    this.commands.global.version(version);
    this.plugins = new PluginsManager(this).register(config?.plugins || []);
    this.events = new EventsManager<Program>();
    this.plugins.attach();
  }

  version(value: VersionNumber) {
    this.commands.global.version(value);
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
    this.emit("beforeRun");

    const {
      args: [first, ...args],
      options,
    } = this.commands.parse(argv);

    const name = String(first);

    let found = this.commands.find(name);

    const none = !first && args.length === 0;

    if (!found && this.commands.global.isImplemented) {
      found = this.commands.global;
    }

    if (found && options["v"]) {
      found.getVersion();
    } else if (options["v"]) {
      this.commands.global.getVersion();
    }

    if (options["h"] || none) {
      if (!found) {
        return this.commands.global.printHelp();
      }
      return found.printHelp(found.raw);
    }

    if (!found) {
      this.emit(`run:*`);
      return this.emit("afterRun");
    }

    // @ts-ignore
    this.emit(`run:${found.name}`);

    await found.execute(args, options, this.tools);

    this.emit("afterRun");
  }
}
