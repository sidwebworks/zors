import { IPlugin } from "zors";

const customLogger = (...args: any[]) => console.log("LOG: ", ...args);

const utilsPlugin: IPlugin = {
  name: "utils-plugin",
  build(program) {
    program.tools.hello = "world";
    program.tools.logger = customLogger;

    return program;
  },
};

declare module "zors" {
  interface Tools {
    logger: typeof customLogger;
    hello: "world";
  }
}

export { utilsPlugin };
