import { CommandManager } from "./managers/Command";
import { EventsManager } from "./managers/Events";
import { IProgramConfig, Tools, VersionNumber } from "./types";

export class Program<T extends Tools = Tools> extends EventsManager<Program> {
  private commander: CommandManager<T>;

  constructor(
    public name: string,
    version: VersionNumber = "0.0.0",
    public config?: IProgramConfig<T>
  ) {
    super();
    const tools = Object.assign({}, config?.tools);
    this.commander = new CommandManager<T>(this, tools);
    this.commander.version(version);
  }

  version(value: VersionNumber) {
    this.commander.version(value);
    return this;
  }

  get command() {
    return this.commander.add.bind(this.commander);
  }

  get register() {
    return this.commander.register.bind(this.commander);
  }

  async run(argv: (string | string)[]) {
    this.emit("beforeRun");

    const {
      args: [first, ...args],
      options,
    } = this.commander.parse(argv);

    const name = String(first);

    const found = this.commander.find(name);

    if (options["v"]) {
      found.printVersion();
    }

    // @ts-ignore
    this.emit(`run:${found.name}`);
    this.emit(`run:*`);

    await found.execute(args, options);

    this.emit("beforeExit");
  }
}
