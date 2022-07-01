import { ZorsError } from '../lib/error';
import { isArray, merge } from '../lib/utils';
import { IPlugin } from '../types';
import { Program } from './program';

export class PluginsManager {
  private program: Program;
  public plugins: Map<string, IPlugin>;

  constructor(program: Program) {
    this.plugins = new Map();
    this.program = program;
  }

  register(input: IPlugin[] | IPlugin) {
    if (isArray<IPlugin[]>(input)) {
      for (let plugin of input) {
        this.plugins.set(plugin.name, plugin);
      }
    } else {
      this.plugins.set(input.name, input);
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
      const next = plugin.build(this.program);

      if (!next) {
        throw new ZorsError(
          `Plugins need to return \`program\`, ${plugin.name}: returns ${next}`
        );
      }

      const { config, tools } = next;

      this.program.tools = merge(this.program.tools, config?.tools, tools);
      this.program.config = merge(this.program.config, config, {
        tools,
      });
    });
  }

  find(name: string) {
    return this.plugins.get(name);
  }
}
