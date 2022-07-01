import { afterEach, describe, expect, it, vi } from 'vitest';
import { IPlugin, Program } from '../src';
import { PluginsManager } from '../src/modules/plugins';

describe('PluginsManager()', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should accept an array of plugins and registers them', async () => {
    const program = new Program('Test');
    const manager = new PluginsManager(program);

    const buildFn = vi.fn((arg) => arg);

    for (let i = 0; i < 10; i++) {
      const plugin: IPlugin = {
        name: `test-plugin-${i}`,
        build: buildFn,
      };

      manager.register(plugin);
    }

    await manager.attach();

    expect(buildFn).toHaveBeenCalledTimes(10);
    expect(buildFn).toHaveBeenCalledWith(program);
  });

  it("should allow a plugin to overwrite program's config/tools", async () => {
    const program = new Program('Test');
    const manager = new PluginsManager(program);

    const buildFn = vi.fn<[Program]>((program) => {
      program.config.printHelpOnNotFound = false;
      program.config.captureErrors = false;
      program.config.tools = { hello: 'world', logger: console.log };

      return program;
    });

    for (let i = 0; i < 10; i++) {
      const plugin: IPlugin = {
        name: `test-plugin-${i}`,
        build: buildFn,
      };

      manager.register(plugin);
    }

    await manager.attach();

    expect(buildFn).toHaveBeenCalledTimes(10);

    expect(buildFn).toHaveBeenCalledWith(program);

    expect(program.config).toEqual({
      printHelpOnNotFound: false,
      concurrentBootstrap:false,
      captureErrors: false,
      formatters: {},
      parser: {},
      plugins: [],
      tools: {
        hello: 'world',
        logger: console.log,
      },
    });

    expect(program.tools).toEqual({
      hello: 'world',
      logger: console.log,
    });
  });
});
