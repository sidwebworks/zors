import { IPlugin } from "zors";
import colors from "ansi-colors";

declare module "zors" {
  interface Tools {
    colors: typeof colors;
  }
}

export const utilsPlugin: IPlugin = {
  name: "utils-plugin",
  build(program) {
    program.tools.colors = colors;

    return program;
  },
};
