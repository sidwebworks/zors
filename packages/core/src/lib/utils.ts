import { ZorsError } from './error';

export const removeBrackets = (raw: string) => raw.replace(/[<[].+/, '').trim();

export const findAllBrackets = (raw: string) => {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;

  const res = [];

  const parse = (match: string[]) => {
    let variadic = false;
    let value = match[1];

    if (value.startsWith('...')) {
      value = value.slice(3);
      variadic = true;
    }

    return {
      required: match[0].startsWith('<'),
      value,
      variadic,
    };
  };

  let angledMatch;

  while ((angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(raw))) {
    res.push(parse(angledMatch));
  }

  let squareMatch;

  while ((squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(raw))) {
    res.push(parse(squareMatch));
  }

  return res;
};

export const findLongest = (arr: string[]) => {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1;
  })[0];
};

export const padRight = (str: string, length: number) => {
  return str.length >= length
    ? str
    : `${str}${' '.repeat(length - str.length)}`;
};

export const camelcase = (input: string) => {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase();
  });
};

export const getFileName = (input: string) => {
  const m = /([^\\\/]+)$/.exec(input);
  return m ? m[1] : '';
};

export const camelcaseOptionName = (name: string) => {
  return name
    .split('.')
    .map((v, i) => (i === 0 ? camelcase(v) : v))
    .join('.');
};

export const noop = () => {};

export function hasOwn(obj: object, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function assert(exp: any): asserts exp {
  if (!exp) throw new ZorsError(`Assertion error`);
}

export function get<T>(obj: Record<string, T>, key: string): T | undefined {
  if (hasOwn(obj, key)) {
    return obj[key];
  }
}

export function getForce<T>(obj: Record<string, T>, key: string): T {
  const v = get(obj, key);
  assert(v != null);
  return v;
}

export function isNumber(x: unknown): boolean {
  if (typeof x === 'number') return true;
  if (/^0x[0-9a-f]+$/i.test(String(x))) return true;
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x));
}
