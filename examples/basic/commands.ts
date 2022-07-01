import { defineCommand } from 'zors';

export const commitCommand = defineCommand<undefined, { message: string }>(
  'commit',
  {
    description: 'Creates a commit with a given message',
    options: [
      { raw: '-m, --message <message>', description: 'Commit message' },
    ],
    examples: ["commit -m 'chore: update packages'"],
    usage: 'commit -m <commit message>',
    action(_, { message }) {
      console.log(`Created a commit: ${message}`);
    },
  }
);
