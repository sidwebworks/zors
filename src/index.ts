import { Program } from "./Program";
import type {
  IProgramConfig,
  Tools,
  VersionNumber,
  Commands,
  IPlugin,
} from "./types";
import { defineCommand, Command } from "./managers/Command";

function zors(
  name: string,
  version?: VersionNumber,
  config?: Omit<IProgramConfig, "tools"> & { tools?: Record<string, any> }
): Program {
  return new Program(name, version, config);
}

export { zors, defineCommand, Command, Program };

export type { Tools, Commands, VersionNumber, IProgramConfig, IPlugin };
