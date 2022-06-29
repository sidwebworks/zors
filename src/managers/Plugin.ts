import { Program } from "../Program";
import { AllTools, IBuildProgram, IPlugin } from "../types";

export class PluginsManager {
  private program: Program;
  public plugins: Map<string, IPlugin>;

  constructor(program: Program) {
    this.plugins = new Map();
    this.program = program;
  }

  register(plugins: IPlugin[]) {
    for (let plugin of plugins) {
      this.plugins.set(plugin.name, plugin);
    }
    return this;
  }

  visit(callback: (p: IPlugin) => void) {
    for (let [_, plugin] of this.plugins.entries()) {
      callback(plugin);
    }
  }

  attach() {
    this.visit((plugin) => {
      const next = plugin.build(this.program as IBuildProgram);
      this.program.tools = Object.assign({}, this.program, next).tools;
      this.program.config = Object.assign({}, this.program, next).config;
    });
  }

  find(name: string) {
    return this.plugins.get(name);
  }
}
