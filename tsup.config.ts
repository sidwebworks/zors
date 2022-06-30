import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm'],
  target: ['ES2020'],
  treeshake: true,
  dts: true,
  clean: true,
});
