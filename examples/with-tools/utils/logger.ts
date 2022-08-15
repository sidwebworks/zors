import pino from 'pino';
import dayjs from 'dayjs';
import { PinoPretty } from 'pino-pretty';
import colors from "picocolors"

// Extend tools type declaration with your custom tools
declare module "zors" {
  interface Tools {
    logger: typeof logger
    pico: typeof colors
  }
}

const prettyConfig: PinoPretty.PrettyOptions = {
  colorize: true,
  levelFirst: true,
};

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: prettyConfig,
  },
  base: {
    pid: false,

  },
  timestamp: () => ``,
});


