import { zors } from "zors";
import { createCommand, updateCommand } from "./commands.js";
import { customLogger } from "./logger.js";

declare module "zors" {
  interface Commands {
    CreateCommand: "create";
    UpdateCommand: "update";
  }

  interface Tools {
    logger: typeof customLogger;
  }
}

const program = zors("quick-strapper", "1.0.0", {
  tools: { logger: customLogger },
});

program.on("register", () => {
  console.log("Command registered");
});

program.on("beforeRun", () => {
  console.log("About to run");
});

program.on("run:create", () => {
  console.log("Running create command");
});

program.on("run:update", () => {
  console.log("Running update command");
});

program.on("beforeExit", () => {
  console.log("About to exit");
});

program.register(createCommand).register(updateCommand);

program.run(process.argv.slice(2));
