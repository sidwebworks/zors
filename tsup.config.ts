import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm', 'cjs'],
  target: ['ES2020'],
  treeshake: true,
  dts: true,
  clean: true,
});
