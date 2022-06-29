import { defineCommand } from "zors";

export const createCommand = defineCommand<[name: string]>("create <name>", {
  description: "Creates a new project",
  aliases: ["c"],
  action([name], opts, tools) {
    const { logger, hello, colors } = tools;
    logger(`Hello ${colors.green(hello)}`, name);
  },
});

export const updateCommand = defineCommand<[string[]]>("update <...names>", {
  description: "Updates all the given packages by name",
  version: "0.0.1",
  aliases: ["c"],
  options: [
    {
      raw: "--strategy",
      description: "update strategy for packages",
      type: [String],
    },
    {
      raw: "--env.name <name>",
      description: "Environment variables",
    },
  ],
  action([names], options, tools) {
    const { logger, colors } = tools;
    logger(colors.cyan("package to update: "));
  },
});
