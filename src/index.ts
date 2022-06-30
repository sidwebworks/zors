import type {
  IProgramConfig,
  Tools,
  VersionNumber,
  Commands,
  IPlugin,
} from './types';

import { Command } from './modules/command';
import { Program } from './modules/program';
import { zors, defineCommand } from './functions';

export { Command, Program, zors, defineCommand };

export type { Tools, Commands, VersionNumber, IProgramConfig, IPlugin };
