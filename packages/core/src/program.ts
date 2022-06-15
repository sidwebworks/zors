import { Command } from "./command";
import fs from "fs-jetpack";
import parse from "yargs-parser";
import { isCommand, isCommandPath } from "./types";
import { EventEmitter } from "events";

interface ProgramOptions {
  name: string;
  description: string;
}

type LifecyleEvents = "beforeExit" | "beforeRun" | "afterRun";

export class Program {
  private commands: Map<string, Command>;
  public name: string;
  public description: string;
  private stack: Promise<any>[] = [];
  private emitter = new EventEmitter();

  constructor({ name, description }: ProgramOptions) {
    this.commands = new Map();
    this.name = name;
    this.description = description;
  }

  async run(input: string | string[]) {
    if (this.stack.length > 0) {
      const modules = await Promise.all(this.stack);

      modules.forEach((m) => {
        const command = m.default;
        this.commands.set(command.name, command);
        this.stack.pop();
      });
    }

    const {
      _: [name, ...args],
      ...options
    } = parse(input);

    const command = this.commands.get(String(name));

    if (!command) throw new Error(`Unknown command ${name}`);

    this.emitter.emit("beforeRun", this);

    await command.execute({ args, options });

    this.emitter.emit("afterRun", this);
  }

  addCommand<T extends Command<any, any>>(maybeCommand: T | string) {
    if (isCommand(maybeCommand)) {
      this.commands.set(maybeCommand.name, maybeCommand);
      return this;
    }

    if (isCommandPath(maybeCommand) && fs.exists(maybeCommand)) {
      this.stack.push(import(maybeCommand));
      return this;
    }

    throw new Error(`Cannout resolve command ${maybeCommand}`);
  }

  on(key: LifecyleEvents, listener: (program: Program) => void) {
    this.emitter.on(key, listener);

    return () => this.emitter.off(key, listener);
  }
}
