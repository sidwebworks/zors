import { describe, expect, it } from 'vitest';
import { parse } from '../src/lib/parser';

describe('flag boolean', () => {
  it('should parse all double dashed args to boolean by default', () => {
    const argv = parse(['moo', '--honk', 'cow'], {
      boolean: true,
    });

    expect(argv).toEqual({
      honk: true,
      _: ['moo', 'cow'],
    });

    expect(typeof argv.honk).toBe('boolean');
  });

  it('should only parse args with double dash and without equals', () => {
    const argv = parse(['moo', '--honk', 'cow', '-p', '55', '--tacos=good'], {
      boolean: true,
    });

    expect(argv).toEqual({
      honk: true,
      tacos: 'good',
      p: 55,
      _: ['moo', 'cow'],
    });

    expect(typeof argv.honk).toBe('boolean');
  });

  it('should parse boolean args with default false', () => {
    const argv = parse(['moo'], {
      boolean: ['t', 'verbose'],
      default: { verbose: false, t: false },
    });

    expect(argv).toEqual({
      verbose: false,
      t: false,
      _: ['moo'],
    });

    expect(typeof argv.verbose).toBe('boolean');
    expect(typeof argv.t).toBe('boolean');
  });

  it('should parse boolean arg groups', () => {
    const argv = parse(['-x', '-z', 'one', 'two', 'three'], {
      boolean: ['x', 'y', 'z'],
    });

    expect(argv).toEqual({
      x: true,
      y: false,
      z: true,
      _: ['one', 'two', 'three'],
    });

    expect(typeof argv.z).toBe('boolean');
    expect(typeof argv.x).toBe('boolean');
    expect(typeof argv.y).toBe('boolean');
  });

  it('should parse chainable boolean and aliased arg ', () => {
    const aliased = ['-h', 'derp'];
    const regular = ['--herp', 'derp'];

    const aliasedArgv = parse(aliased, {
      boolean: 'herp',
      alias: { h: 'herp' },
    });

    const propertyArgv = parse(regular, {
      boolean: 'herp',
      alias: { h: 'herp' },
    });

    const expected = {
      herp: true,
      h: true,
      _: ['derp'],
    };

    expect(aliasedArgv).toEqual(expected);
    expect(propertyArgv).toEqual(expected);
  });
});
