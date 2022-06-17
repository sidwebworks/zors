import { defineCommand } from "../dist/index.js";

const command = defineCommand("create <name> <...files> --lang", {
  description: "Creates a new package",
  alias: ["c"],
  options: [{ name: "--lang", description: "Select a template language" }],
  action: async (files, options, { logger }) => {
    logger.info("options: ", options);
    logger.info("files: ", files);
  },
});

export default command;
