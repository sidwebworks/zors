import path from "path";
import { fileURLToPath } from "url";
import { defineCommand } from "./command";
import { Program } from "./program";

export { defineCommand };

export const command = defineCommand({
  name: "create",
  description: "Creates something",
  run: (args, options) => {
    console.log(`So you want to create a project by the name ${args[0]}`);
    console.log(`And the language will be ${options.lang}`);
  },
});

const program = new Program({ description: "My awesome CLI", name: "hoot" });

const dirname = fileURLToPath(import.meta.url);

program
  .addCommand(command)
  .addCommand(path.join(dirname, "../../commands/hello.js"))
  .execute(process.argv.slice(2));
