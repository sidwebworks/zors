import { Command } from '../command';

export const isCommand = (c: any): c is Command => c instanceof Command;

export const isCommandPath = (c: any): c is string => typeof c === 'string';

export function isObject<T extends object>(val: any): val is T {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}
