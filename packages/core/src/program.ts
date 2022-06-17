import colors from "ansi-colors";
import { existsSync } from "fs";
import { Command, RootCommand } from "./command";
import { Emitter } from "./lib/emitter";
import { ZorsError } from "./lib/error";
import { Logger } from "./lib/logger";
import { parse } from "./lib/parser";
import { findAllBrackets, removeBrackets } from "./lib/utils";
import { CommandConfig, ParseOptions, Tools } from "./types";
import { isCommand } from "./types/guards";

type ProgramEvents =
  | "onBeforeRun"
  | "onAfterRun"
  | "onError"
  | "onExit"
  | "onRegister";

interface ProgramConfig {
  parser?: ParseOptions;
  tools?: Tools;
  captureErrors?: boolean;
}

const defaultConfig: ProgramConfig = {
  parser: {},
  tools: { logger: Logger(), colors },
  captureErrors: true,
};

export class Program extends Emitter<Record<ProgramEvents, Program>> {
  commands: Command[];
  tools: Tools;
  raw: string[];
  args: (string | number)[];
  options: Record<string, any>;
  root: Command;
  private importQueue: Promise<{ default: Command<any, any> }>[] = [];

  /**
   * @param name Program name to display in help and version
   */
  constructor(public name: string = "", public config: ProgramConfig = {}) {
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

  command(raw: string, description: string, config?: CommandConfig) {
    const command = new Command(removeBrackets(raw), raw, description, config);
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

    if (typeof maybeCommand === "string") {
      this.importQueue.push(import(maybeCommand));
    }

    return this;
  }

  parse(input: string[]) {
    const aliases: ParseOptions["alias"] = {
      version: ["v"],
    };

    for (let command of this.commands) {
      aliases[command.name] = command.aliases;
    }

    const config = Object.assign({}, this.config.parser, {
      alias: aliases,
    });

    const { _: args, ...options } = parse(input, config);

    this.args = args;
    this.options = options;
    this.raw = input;

    return { args, options };
  }

  async resolveCommandImports() {
    if (this.importQueue.length > 0) {
      const modules = await Promise.all(this.importQueue).catch((err) => {
        throw new ZorsError(`Failed to auto-import commands from ${err.url}`);
      });

      modules.forEach((m) => {
        const command = m.default;
        this.commands.push(command);
        command.register(this);
        this.importQueue.pop();
      });
    }
  }

  async run(input: string[]) {
    try {
      this.emit("onBeforeRun", this);

      await this.resolveCommandImports();

      const {
        args: [name, ...args],
        options,
      } = this.parse(input);

      const _name = String(name);

      const command = this.commands.find((c) => c.match(_name)) || this.root;

      if (command) {
        if (command.hasOption("version")) {
          return command.printVersion();
        }

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
      this.emit("onError", { error: err, program: this });
      if (!this.config.captureErrors) {
        throw err;
      }
    } finally {
      this.emit("onAfterRun", this);
    }
  }
}
