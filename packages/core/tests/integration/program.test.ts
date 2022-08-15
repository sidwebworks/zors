import { describe, it } from 'vitest';
import { run } from '../helpers';

describe.concurrent('Program()', async () => {
  it('should print the program/command version', async ({ expect }) => {
    const cli = await run('', 'basic', ['--v']);

    expect(cli.stdout).toMatchSnapshot();
  });

  it('should run the command action', async ({ expect }) => {
    const cli = await run('init', 'basic', ['--commit=true']);

    expect(cli.stdout).toMatchSnapshot();
  });

  it('should run with variadic args', async ({ expect }) => {
    const cli = await run('add', 'basic', [
      'index.html',
      'app.js',
      'styles.css',
    ]);
    expect(cli.stdout).toMatchSnapshot();
  });

  it('should print help output', async ({ expect }) => {
    const cli = await run('', 'basic', ['--h']);
    expect(cli.stdout).toMatchSnapshot();
  });

  it('should validate the input args', async ({ expect }) => {
    try {
      await run('add', 'basic', []);
    } catch (error: any) {
      expect(error.stderr).toMatch(
        'ZorsError: Missing required arg for command `add <...files>`'
      );
    }
  });

  it('should validate the input options', async ({ expect }) => {
    try {
      await run('init', 'basic', []);
    } catch (error: any) {
      expect(error.stderr).toMatch(
        'ZorsError: option `-c, --commit <boolean>` value is missing'
      );
    }
  });

  it('should run with plugins', async ({ expect }) => {
    const cli = await run('init', 'with-plugins', ['--commit=true']);

    expect(cli.stdout).toMatchSnapshot();
  });

  it('should run with tools', async ({ expect }) => {
    const cli = await run('init', 'with-tools', ['--commit=true']);

    expect(cli.stdout).toMatchSnapshot();
  });
});
