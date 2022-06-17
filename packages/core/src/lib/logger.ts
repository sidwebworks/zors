import colors, { StyleFunction } from 'ansi-colors';
import { ILogger } from '../types';

export function Logger(options?: {
  colors: Record<keyof ILogger, StyleFunction>;
}): ILogger {
  const types = {
    error: colors.red,
    debug: colors.gray,
    info: colors.cyan,
    success: colors.green,
    warn: colors.yellow,
    time: colors.magenta,
    ...(options?.colors && options.colors),
  };

  const timeMap = new Map<string, Date>();

  return {
    debug(...args: any[]) {
      console.log(types['debug'].bold(`DEBUG:`), ...args);
    },
    warn(...args: any[]) {
      console.warn(types['warn'].bold(`WARNING:`), ...args);
    },
    success(...args: any[]) {
      console.log(types['success'].bold(`SUCCESS:`), ...args);
    },
    error(...args: any[]) {
      console.log(types['error'].bold(`ERROR:`), ...args);
    },
    info(...args: any[]) {
      console.info(types['info'].bold(`INFO:`), ...args);
    },
    log(...args: any[]) {
      console.log(...args);
    },
    start(name: string) {
      timeMap.set(name, new Date());
    },
    stop(name: string) {
      const found = timeMap.get(name);

      if (!found) return;

      const duration = new Date().getTime() - found.getTime();

      console.log(types['time'].bold(`TIME:`), duration);
    },
  };
}
