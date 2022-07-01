import { defineCommand, zors } from 'zors';
import { logger } from './utils/logger.js';
import colors from "picocolors"

// Add your tools inside config
const program = zors('git', '1.0.0', {
  tools: {
    logger,
    pico: colors
  },
});

program
  .help() // Show help
  .command<undefined, { commit: boolean }>(
    'init',
    'Initialize an empty git repository'
  )
  .option('-c, --commit', 'stage files and create an initial commit')
  .example('init --no-commit')
  .action((_, { commit }, { logger ,pico}) => {
    logger.info(pico.bgGreen(pico.black(`Intialized an empty git repository`)));
    if (commit) {
      logger.info(`Created an initial commit`);
    }
  });

export const commitCommand = defineCommand<undefined, { message: string }>(
  'commit',
  {
    description: 'Creates a commit with a given message',
    options: [
      { raw: '-m, --message <message>', description: 'Commit message' },
    ],
    examples: ["commit -m 'chore: update packages'"],
    usage: 'commit -m <commit message>',
    action(_, { message }, { logger,pico }) {
      logger.info(pico.red(`Created a commit: ${pico.bgCyan(message)}`));
    },
  }
);

export const addCommand = defineCommand<string[]>('add <...files>', {
  description: 'Add files to track changes',
  examples: ['add styles.css app.js index.html', 'add .'],
  usage: 'add <...list of files>',
  action(files, _, { logger }) {
    if (files.length === 1 && files[0] === '.') {
      logger.info(`Tracking all files`);
    } else {
      logger.info(`Tracking files: `, files);
    }
  },
});

program.register(commitCommand).register(addCommand).run(process.argv.slice(2));
