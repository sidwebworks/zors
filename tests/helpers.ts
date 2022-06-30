import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

export const run = (command: string, example: string, args: any[]) => {
  return execa(`ts-node-esm`, [getExample(example), command, ...args]);
};

export const __filename = fileURLToPath(import.meta.url);

export const __dirname = dirname(__filename);

export const getExample = (file: string) => {
  return path.relative(
    process.cwd(),
    path.join(__dirname, '../examples', file)
  );
};
