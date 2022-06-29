import { IPlugin } from "zors";
import colors from "ansi-colors";

const customLogger = (...args: any[]) => console.log("LOG: ", ...args);

const utilsPlugin: IPlugin = {
  name: "utils-plugin",
  build(program) {
    program.tools.hello = "world";
    program.tools.logger = customLogger;
    program.tools.colors = colors;

    return program;
  },
};

declare module "zors" {
  interface Tools {
    logger: typeof customLogger;
    hello: "world";
    colors: typeof colors;
  }
}

export { utilsPlugin };
