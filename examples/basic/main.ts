import { zors } from 'zors';
import { commitCommand, statusCommand } from './commands.js';

const program = zors('git', '1.0.0');

program
  .help() // Show help
  .version("1.0.0")
  .command<undefined, { commit: boolean }>(
    'init',
    'Initialize an empty git repository'
  )
  .option('-c, --commit', 'stage files and create an initial commit')
  .example('init --no-commit')
  .action((_, { commit }) => {
    console.log(`Intialized an empty git repository`);
    if (commit) {
      console.log(`Created an initial commit`);
    }
  })
  .command<string[]>('add <...files>', 'Add files to track')
  .action((files) => {
    if (files.length === 1 && files[0] === '.') {
      console.log(`Tracking all files`);
    } else {
      console.log(`Tracking files: `, files);
    }
  })
  .register(commitCommand)
  .register(statusCommand);


program.run(process.argv.slice(2));
