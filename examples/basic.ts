import { zors } from '../dist/index.js';

const program = zors('git', '1.0.0');

program.run(process.argv.slice(2));
