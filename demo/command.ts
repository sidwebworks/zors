import { defineCommand } from "zors";

export const someCommand = defineCommand("update <name>", {
  description: "Updates a package",
  action: () => {
    console.log("Update package");
  },
});
