import path from "path";
import { fileURLToPath } from "url";
import { defineCommand } from "./command";
import { Program } from "./program";

const updateCommand = defineCommand<[string, string[]], { name: string }>(
  "update <name> [...files]",
  {
    description: "Updates an existing package",
    alias: ["u"],
    action: async ([name, files], options, { logger }) => {
      logger.info(`UPDATE TYPE: `, name);

      files.forEach((f) => {
        logger.info(`Updating package:`, f);
      });

      logger.success("FINISHED UPDATING PACKAGES");
    },
  }
);

const program = new Program("ZORS");

program.on("onError", ({ error, program }) => {
  program?.tools.logger.error(error);
});

// Assigns stuff to the Root command
program.root
  .option("--name", "Name of the sub command")
  .version("0.1.0")
  .action(function (args, options, { logger }) {
    logger.log(args, options);
  });

const dirname = fileURLToPath(import.meta.url);

program
  .addCommand(path.join(dirname, "../../demo/create.js"))
  .addCommand(updateCommand);

program
  .command("download <name>", "Downloads something")
  .option("--no-commit", "Should do a git commit", { default: false })
  .version("8.0.0");


program.run(process.argv.slice(2));

export { defineCommand, Program };
