import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { execa, Options } from 'execa';

export const run = (
  command: string,
  example: string,
  args: any[],
  opts: Options = {}
) => {
  return execa(`ts-node-esm`, [getExample(example), command, ...args], opts);
};

export const __filename = fileURLToPath(import.meta.url);

export const __dirname = dirname(__filename);

export const getExample = (name: string) => {
  const result = path.relative(__dirname ,path.join('../examples', name, 'main.ts'));

  return result;
};
