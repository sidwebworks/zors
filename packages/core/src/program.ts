import colors from "ansi-colors";
import { existsSync } from "fs";
import { Command, RootCommand } from "./command";
import { Emitter } from "./lib/emitter";
import { ZorsError } from "./lib/error";
import { Logger } from "./lib/logger";
import { parse } from "./lib/parser";
import { ParseOptions, Tools } from "./types";
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
}

const defaultConfig = { parser: {}, tools: { logger: Logger(), colors } };

export class Program extends Emitter<Record<ProgramEvents, Program>> {
  commands: Command[];
  tools: Tools;
  private raw: string[];
  private args: (string | number)[];
  private options: Record<string, any>;
  public root: Command;
  private importQueue: Promise<{ default: Command<any, any> }>[] = [];

  /**
   * @param name Program name to display in help and version
   */
  constructor(public name: string = "", public config: ProgramConfig = {}) {
    super();
    this.args = [];
    this.commands = [];
    this.options = {};
    this.raw = [];
    this.config = Object.assign(defaultConfig, config);
    this.tools = this.config.tools!;
    this.root = new RootCommand(this);
  }

  usage(text: string) {
    this.root.usage(text);
    return this;
  }

  addCommand<T extends Command<any, any>>(maybeCommand: T | string) {
    if (isCommand(maybeCommand)) {
      this.commands.push(maybeCommand);
      maybeCommand.register(this);
    }

    if (typeof maybeCommand === "string") {
      if (!existsSync(maybeCommand)) {
        throw new ZorsError(
          `Failed to auto-import command from ${maybeCommand}`
        );
      }

      this.importQueue.push(import(maybeCommand));
    }

    return this;
  }

  parse(input: string[]) {
    const aliases: ParseOptions["alias"] = {};

    for (let command of this.commands) {
      aliases[command.name] = command.aliases;
    }

    const config = Object.assign({}, this.config.parser, {
      alias: aliases,
    });

    const { _: args, ...options } = parse(input, config);

    this.args = args;
    this.options = options;

    return { args, options };
  }

  async resolveCommandImports() {
    if (this.importQueue.length > 0) {
      const modules = await Promise.all(this.importQueue);

      modules.forEach((m) => {
        const command = m.default;
        this.commands.push(command);
        command.register(this);
        this.importQueue.pop();
      });
    }
  }

  async run(input: string[]) {
    await this.resolveCommandImports();

    const {
      args: [name, ...args],
      options,
    } = this.parse(input);

    const commandName = String(name);

    const found = this.commands.find((c) => c.match(commandName)) || this.root;

    if (found) {
      const _args = found.args.reduce<any[]>((acc, curr, index) => {
        if (curr.variadic) {
          acc.push(args.slice(index));
        } else {
          acc.push(args[index]);
        }
        return acc;
      }, []);

      await found.execute(_args, options, this.tools);
    }
  }
}
