import { defineCommand, Program } from '@zors/core';

const program = new Program('quick-strapper');

type UpdateArgs = [string[]];

const command = defineCommand<UpdateArgs>('update <...names>', {
  description: 'Updates all the given packages by name',
  version: '0.0.1',
  options: [
    { name: '--strategy', description: 'update strategy for packages' },
  ],
  examples: ['--strategy=bump'],
  action([filename], options, { logger }) {
    logger.info('file: ', filename);
  },
});

program
  .command<UpdateArgs>(
    'update <...names>',
    'Updates all the given packages by name'
  )
  .version('0.0.1')
  .option('--strategy', 'update strategy for packages')
  .example('--strategy=bump')
  .action(([filename], options, { logger }) => {
    logger.info('file: ', filename);
  });

program.addCommand(command);

program.run(process.argv.slice(2));
