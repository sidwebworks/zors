import { zors } from "zors";
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
  formatters: {
    version(number, name) {
      const colors = this.tools.colors;
      return colors.bold(
        `${colors.cyanBright(name)}/${colors.greenBright(number)}`
      );
    },
  },
});

program.on("register", () => {
  console.log("Command registered");
});

program.on("beforeRun", () => {
  console.log("About to run\n");
});

program.on("run:create", () => {
  console.log("Running create command");
});

program.on("run:update", () => {
  console.log("Running update command");
});

program.on("run:*", () => {
  console.log("Unknown command!!!!");
});

program.register(createCommand).register(updateCommand);

program.run(process.argv.slice(2));
