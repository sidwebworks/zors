import { defineCommand } from "zors";

export const commitCommand = defineCommand<any, { message: string }>("commit", {
  description: "Commit the staged changes",
  options: [
    { raw: "--no-install", description: "should install" },
    { raw: "--message <message>", description: "Commit message" },
  ],
  action(_, options, { colors }) {
    console.log(colors.red("Committing changes: "), options);
  },
});


