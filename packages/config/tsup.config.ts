import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  shims: false,
  dts: true,
  clean: true,
  env: {
    NODE_ENV: process.env.NODE_ENV || "production",
  },
})
