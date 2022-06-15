import { Command } from "./command";
import fs from "fs-jetpack";
import parse from "yargs-parser";
import { isCommand, isCommandPath } from "./types";
import Module from "module";

interface ProgramOptions {
  name: string;
  description: string;
}

export class Program {
  private commands: Map<string, Command>;
  private name: string;
  private description: string;
  private stack: Promise<any>[] = [];

  constructor({ name, description }: ProgramOptions) {
    this.commands = new Map();
    this.name = name;
    this.description = description;
  }

  public async execute(input: string | string[]) {
    if (this.stack.length > 0) {
      const modules = await Promise.all(this.stack);

      modules.forEach((m) => {
        const command = m.default;
        this.commands.set(command.name, command);
      });

      this.stack = [];
    }

    const {
      _: [name, ...args],
      ...options
    } = parse(input);

    console.log(name, args, options);

    const command = this.commands.get(String(name));

    if (!command) throw new Error(`Unknown command ${name}`);

    console.log(command);

    command.run(args, options);
  }

  addCommand(maybeCommand: Command | string) {
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
}
