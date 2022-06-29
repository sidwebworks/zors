import picocolors from "picocolors";
import { CommandManager } from "./managers/Command";
import { EventsManager } from "./managers/Events";
import { PluginsManager } from "./managers/Plugin";
import { AllTools, IProgramConfig, VersionNumber } from "./types";

export class Program {
  private commands: CommandManager;
  private plugins: PluginsManager;
  private events: EventsManager<Program>;
  public tools: AllTools = { colors: picocolors };

  constructor(
    public name: string,
    version: VersionNumber = "0.0.0",
    public config?: IProgramConfig
  ) {
    this.tools = Object.assign(this.tools, config?.tools);
    this.commands = new CommandManager(this).version(version);
    this.plugins = new PluginsManager(this).register(config?.plugins || []);
    this.events = new EventsManager<Program>();
    this.plugins.attach();
  }

  version(value: VersionNumber) {
    this.commands.version(value);
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

    const found = this.commands.find(name);

    if (options["v"]) {
      found.printVersion();
    }

    // @ts-ignore
    this.emit(`run:${found.name}`);
    this.emit(`run:*`);

    await found.execute(args, options, this.tools);

    this.emit("beforeExit");
  }
}
