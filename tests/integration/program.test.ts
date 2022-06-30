import { describe, expect, it } from 'vitest';
import { run } from '../helpers';

describe('Program()', () => {
  it('should print the program/command version', async () => {
    const cli = await run('', 'basic.ts', ['--v']);

    expect(cli.stdout).toMatchSnapshot();
  });
});
