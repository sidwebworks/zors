import { defineCommand } from "../dist/index.js";

const command = defineCommand({
  name: "hello",
  description: "Says hello",
  run: () => {},
});

export default command;
