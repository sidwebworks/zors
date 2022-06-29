import { zors } from "zors";
import { utilsPlugin } from "./plugin.js";
import { commitCommand } from "./commands.js";

declare module "zors" {
  interface Commands {
    init: "init";
    add: "add";
    commit: "commit";
  }
}

const program = zors("git", "1.0.0", {
  plugins: [utilsPlugin],
  formatters: {
    version(version, name) {
      const { colors } = this.tools;
      return colors.bold(
        `Yeh hai version: ${colors.cyan(name)}/v${colors.green(version)}`
      );
    },
    help(sections) {
      return sections;
    },
  },
});

program.on("run:init", () => {
  console.log("Init command was called!!!!");
});

program
  .command("init", "Initializes a empty git repository")
  .version("1.4.5")
  .usage("git init")
  .example("git init")
  .action((args, options, { colors }) => {
    console.log(colors.greenBright("Initialized an empty git repository"));
  })
  .command<string[]>("add <...files>", "Stages the given list of files")
  .action((files, options, { colors }) => {
    if (files.length === 1 && files[0] === ".") {
      console.log(colors.cyanBright("Staging all the un-tracked files"));
    } else {
      console.log(colors.yellowBright("Staging files: "), files);
    }
  })
  .register(commitCommand);

program.run(process.argv.slice(2));


