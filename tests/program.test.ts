import { expect, it, describe } from 'vitest';
import { Program } from '../src';
import { RootCommand } from '../src/command';

describe('Program()', () => {
  const program = new Program('TEST');

  it('creates a new Program', () => {
    expect(program).toBeInstanceOf(Program);
  });

  it('registers a root command', () => {
    expect(program.root).toBeInstanceOf(RootCommand);
  });

  it('parses the given input and returns arguements and options', () => {
    const argv = ['create', 'my-app', '--no-commit', '--lang=ts', '-v'];

    expect(program.parse(argv)).toEqual({
      args: ['create', 'my-app'],
      options: { 'no-commit': true, lang: 'ts', version: true, v: true },
    });
  });
});
