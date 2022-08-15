import { zors } from 'zors';
import { asyncPlugin, colorsPlugin, loggerPlugin } from './plugins.js';

// Add your tools inside config
const program = zors('git', '1.0.0', {
  plugins: [colorsPlugin()],
});

program
  .help() // Show help
  .command<undefined, { commit: boolean }>(
    'init',
    'Initialize an empty git repository'
  )
  .option('-c, --commit', 'stage files and create an initial commit')
  .example('init --no-commit')
  .action((_, { commit }, { logger, colors }) => {
    console.log(
      colors.bgGreen(colors.black(`Intialized an empty git repository`))
    );

    if (commit) {
      console.log(`Created an initial commit`);
    }
  });

program.run(process.argv.slice(2));
