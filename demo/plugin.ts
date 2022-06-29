import { IPlugin } from "zors";
import colors from "ansi-colors";

const logger = (...args: any[]) => console.log("LOGGG: ", ...args);

declare module "zors" {
  interface Tools {
    colors: typeof colors;
    logger: typeof logger;
  }
}

export const utilsPlugin: IPlugin = {
  name: "utils-plugin",
  build(program) {
    program.tools.colors = colors;
    program.tools.logger = logger;

    return program;
  },
};