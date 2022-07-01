/**
 * The Parser is the exact same implementation of the `flags` package
 * from Deno standard library, this is for compatibility reasons.
 *
 * The only difference is we don't use a runtime specific `assert` function
 */

import {
  NestedMapping,
  ParserFlags,
  ParserOptions,
  ParserResult,
} from '../types';
import { assert, camelcaseOptionName, get, getForce, isNumber } from './utils';

function hasKey(obj: NestedMapping, keys: string[]): boolean {
  let o = obj;
  keys.slice(0, -1).forEach((key) => {
    o = (get(o, key) ?? {}) as NestedMapping;
  });

  const key = keys[keys.length - 1];
  return key in o;
}

export function parse(
  args: string[],
  {
    '--': doubleDash = false,
    alias = {},
    boolean = false,
    default: defaults = {},
    stopEarly = false,
    string = [],
    collect = [],
    negatable = [],
    unknown = (i: string): unknown => i,
  }: ParserOptions = {}
): ParserResult {
  const flags: ParserFlags = {
    bools: {},
    strings: {},
    unknownFn: unknown,
    allBools: false,
    collect: {},
    negatable: {},
  };

  if (boolean !== undefined) {
    if (typeof boolean === 'boolean') {
      flags.allBools = !!boolean;
    } else {
      const booleanArgs = typeof boolean === 'string' ? [boolean] : boolean;

      for (const key of booleanArgs.filter(Boolean)) {
        flags.bools[key] = true;
      }
    }
  }

  const aliases: Record<string, string[]> = {};

  if (alias !== undefined) {
    for (const key in alias) {
      const val = getForce(alias, key);
      if (typeof val === 'string') {
        aliases[key] = [val];
      } else {
        aliases[key] = val;
      }

      for (const alias of getForce(aliases, key)) {
        aliases[alias] = [key].concat(aliases[key].filter((y) => alias !== y));
      }
    }
  }

  if (string !== undefined) {
    const stringArgs = typeof string === 'string' ? [string] : string;

    for (const key of stringArgs.filter(Boolean)) {
      flags.strings[key] = true;
      const alias = get(aliases, key);
      if (alias) {
        for (const al of alias) {
          flags.strings[al] = true;
        }
      }
    }
  }

  if (collect !== undefined) {
    const collectArgs = typeof collect === 'string' ? [collect] : collect;

    for (const key of collectArgs.filter(Boolean)) {
      flags.collect[key] = true;
      const alias = get(aliases, key);
      if (alias) {
        for (const al of alias) {
          flags.collect[al] = true;
        }
      }
    }
  }

  if (negatable !== undefined) {
    const negatableArgs =
      typeof negatable === 'string' ? [negatable] : negatable;

    for (const key of negatableArgs.filter(Boolean)) {
      flags.negatable[key] = true;
      const alias = get(aliases, key);
      if (alias) {
        for (const al of alias) {
          flags.negatable[al] = true;
        }
      }
    }
  }

  const argv: ParserResult = { _: [] };

  function argDefined(key: string, arg: string): boolean {
    return (
      (flags.allBools && /^--[^=]+$/.test(arg)) ||
      get(flags.bools, key) ||
      !!get(flags.strings, key) ||
      !!get(aliases, key)
    );
  }

  function setKey(
    obj: NestedMapping,
    name: string,
    value: unknown,
    collect = true
  ): void {
    let o = obj;
    const keys = name.split('.');
    keys.slice(0, -1).forEach(function (key): void {
      if (get(o, key) === undefined) {
        o[key] = {};
      }
      o = get(o, key) as NestedMapping;
    });

    const key = keys[keys.length - 1];
    const collectable = collect && !!get(flags.collect, name);

    if (!collectable) {
      o[key] = value;
    } else if (get(o, key) === undefined) {
      o[key] = [value];
    } else if (Array.isArray(get(o, key))) {
      (o[key] as unknown[]).push(value);
    } else {
      o[key] = [get(o, key), value];
    }
  }

  function setArg(
    key: string,
    val: unknown,
    arg: string | undefined = undefined,
    collect?: boolean
  ): void {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg, key, val) === false) return;
    }

    const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val;
    setKey(argv, key, value, collect);

    const alias = get(aliases, key);
    if (alias) {
      for (const x of alias) {
        setKey(argv, x, value, collect);
      }
    }
  }

  function aliasIsBoolean(key: string): boolean {
    return getForce(aliases, key).some(
      (x) => typeof get(flags.bools, x) === 'boolean'
    );
  }

  let notFlags: string[] = [];

  // all args after "--" are not parsed
  if (args.includes('--')) {
    notFlags = args.slice(args.indexOf('--') + 1);
    args = args.slice(0, args.indexOf('--'));
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (/^--.+=/.test(arg)) {
      const m = arg.match(/^--([^=]+)=(.*)$/s);
      assert(m != null);
      const [, key, value] = m;

      if (flags.bools[key]) {
        const booleanValue = value !== 'false';
        setArg(key, booleanValue, arg);
      } else {
        //! MODIFICATION: Parse keys as camel case
        setArg(camelcaseOptionName(key), value, arg);
      }
    } else if (
      /^--no-.+/.test(arg) &&
      get(flags.negatable, arg.replace(/^--no-/, ''))
    ) {
      const m = arg.match(/^--no-(.+)/);
      assert(m != null);
      setArg(m[1], false, arg, false);
    } else if (/^--.+/.test(arg)) {
      const m = arg.match(/^--(.+)/);
      assert(m != null);
      const [, key] = m;
      const next = args[i + 1];

      if (
        next !== undefined &&
        !/^-/.test(next) &&
        !get(flags.bools, key) &&
        !flags.allBools &&
        (get(aliases, key) ? !aliasIsBoolean(key) : true)
      ) {
        setArg(key, next, arg);
        i++;
      } else if (/^(true|false)$/.test(next)) {
        setArg(key, next === 'true', arg);
        i++;
      } else {
        setArg(key, get(flags.strings, key) ? '' : true, arg);
      }
    } else if (/^-[^-]+/.test(arg)) {
      const letters = arg.slice(1, -1).split('');

      let broken = false;
      for (let j = 0; j < letters.length; j++) {
        const next = arg.slice(j + 2);

        if (next === '-') {
          setArg(letters[j], next, arg);
          continue;
        }

        if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
          setArg(letters[j], next.split(/=(.+)/)[1], arg);
          broken = true;
          break;
        }

        if (
          /[A-Za-z]/.test(letters[j]) &&
          /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)
        ) {
          setArg(letters[j], next, arg);
          broken = true;
          break;
        }

        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArg(letters[j], arg.slice(j + 2), arg);
          broken = true;
          break;
        } else {
          setArg(letters[j], get(flags.strings, letters[j]) ? '' : true, arg);
        }
      }

      const [key] = arg.slice(-1);
      if (!broken && key !== '-') {
        if (
          args[i + 1] &&
          !/^(-|--)[^-]/.test(args[i + 1]) &&
          !get(flags.bools, key) &&
          (get(aliases, key) ? !aliasIsBoolean(key) : true)
        ) {
          setArg(key, args[i + 1], arg);
          i++;
        } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
          setArg(key, args[i + 1] === 'true', arg);
          i++;
        } else {
          setArg(key, get(flags.strings, key) ? '' : true, arg);
        }
      }
    } else {
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push(flags.strings['_'] ?? !isNumber(arg) ? arg : Number(arg));
      }
      if (stopEarly) {
        argv._.push(...args.slice(i + 1));
        break;
      }
    }
  }

  for (const [key, value] of Object.entries(defaults)) {
    if (!hasKey(argv, key.split('.'))) {
      setKey(argv, key, value);

      if (aliases[key]) {
        for (const x of aliases[key]) {
          setKey(argv, x, value);
        }
      }
    }
  }

  for (const key of Object.keys(flags.bools)) {
    if (!hasKey(argv, key.split('.'))) {
      const value = get(flags.collect, key) ? [] : false;
      setKey(argv, key, value, false);
    }
  }

  for (const key of Object.keys(flags.strings)) {
    if (!hasKey(argv, key.split('.')) && get(flags.collect, key)) {
      setKey(argv, key, [], false);
    }
  }

  if (doubleDash) {
    argv['--'] = [];
    for (const key of notFlags) {
      argv['--'].push(key);
    }
  } else {
    for (const key of notFlags) {
      argv._.push(key);
    }
  }

  return argv;
}
