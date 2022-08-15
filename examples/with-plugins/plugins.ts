import dayjs from 'dayjs';
import fs from 'fs/promises';
import picocolors from 'picocolors';
import pino, { Logger } from 'pino';
import { PinoPretty } from 'pino-pretty';
import { IPlugin } from 'zors';

// Extend tools type declaration with your plugin tools
declare module 'zors' {
  interface Tools {
    logger: Logger;
    colors: typeof picocolors;
    directory: string[];
  }
}

export const loggerPlugin = (options?: PinoPretty.PrettyOptions): IPlugin => {
  return {
    name: 'logger-plugin',
    build(program) {
      program.tools.logger = pino({
        transport: {
          target: 'pino-pretty',
          options,
        },
        base: {
          pid: false,
        },
        timestamp: () => ``,
      });

      return program;
    },
  };
};

export const colorsPlugin = (): IPlugin => {
  return {
    name: 'colors-plugin',
    build(program) {
      program.tools.colors = picocolors;
      return program;
    },
  };
};


export const asyncPlugin = (): IPlugin => {
  return {
    name: 'async-plugin',
    async build(program) {
      const buff = await fs.readdir('.', { encoding: 'utf-8' });
      
      program.tools.directory = buff;

      return program;
    },
  };
};
