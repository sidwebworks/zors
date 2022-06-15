import path from "path";
import { fileURLToPath } from "url";
import { defineCommand } from "./command";
import { Program } from "./program";

export { defineCommand };

export const command = defineCommand<[filename: string], { lang: string }>({
  name: "create",
  description: "Creates something",
  execute: ({ args, options }) => {
    console.log(`\nSo you want to create a project by the name ${args[0]}`);
    console.log(`And the language will be ${options.lang}`);
  },
});

const program = new Program({ description: "My awesome CLI", name: "hoot" });

program.on("beforeRun", (prog) => {
  console.log("About to run", prog.name);
});

program.on("afterRun", (prog) => {
  console.log("Done running", prog.name);
});

const dirname = fileURLToPath(import.meta.url);

program
  .addCommand(command)
  .addCommand(path.join(dirname, "../../commands/hello.js"))
  .run(process.argv.slice(2));
