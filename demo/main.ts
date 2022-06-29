import { IPlugin, zors } from "zors";
import { createCommand, updateCommand } from "./commands.js";
import { utilsPlugin } from "./plugins.js";

declare module "zors" {
  interface Commands {
    create: "create";
    update: "update";
  }
}

const program = zors("quick-strapper", "1.0.0", {
  plugins: [utilsPlugin],
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
