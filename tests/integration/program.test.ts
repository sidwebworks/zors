import { describe, expect, it } from 'vitest';
import { run } from '../helpers';

describe('Program()', () => {
  it('should print the program/command version', async () => {
    const cli = await run('', 'basic.ts', ['--v']);

    expect(cli.stdout).toMatchSnapshot();
  });

  it('should run the command action', async () => {
    const cli = await run('init', 'basic.ts', []);

    expect(cli.stdout).toMatchSnapshot();
  });

  it('should run with variadic args', async () => {
    const cli = await run('add', 'basic.ts', [
      'index.html',
      'app.js',
      'styles.css',
    ]);

    expect(cli.stdout).toMatchSnapshot();
  });

  it('should print help output', async () => {
    const cli = await run('', 'basic.ts', ['--h']);

    expect(cli.stdout).toMatchSnapshot();
  });
});


