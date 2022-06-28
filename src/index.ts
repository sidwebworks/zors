import { Program } from "./Program";
import { IProgramConfig, Tools, VersionNumber, Commands } from "./types";
import { defineCommand, Command } from "./managers/Command";

function zors<T extends Tools = Tools>(
  name: string,
  version?: VersionNumber,
  config?: IProgramConfig<T>
): Program<T> {
  return new Program<T>(name, version, config);
}

export { zors, defineCommand, Command, Program };

export type { Tools, Commands, VersionNumber, IProgramConfig };
