import { zors } from "zors";
import { someCommand } from "./command.js";
import { utilsPlugin } from "./plugin.js";

const program = zors("git", "1.0.0", {
  plugins: [utilsPlugin],
});

declare module "zors" {
  interface Commands {
    init: "init";
    update: "update";
  }
}

program
  .command("init", "Initializises an empty git repo")
  .version("3.4.5")
  .action((_, options, tools) => {
    const { colors, logger } = tools;
    logger(colors.cyan("Initialize a git repo"));
  })
  .command<string[]>("add <...files>", "Stages given files")
  .version("2.4.5")
  .action((files) => {
    if (files.length === 1 && files[0] === ".") {
      console.log("Staging all files ");
    } else {
      console.log("Staging: ", files);
    }
  });

program.on("run:update", () => {
  console.log("Update command was called");
});

program.register(someCommand);

program.run(process.argv.slice(2));
