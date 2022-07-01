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

export const statusCommand = defineCommand<undefined, { verbose: string }>(
  'status',
  {
    description: 'Show git tree status',
    options: [{ raw: '-v, --verbose', description: 'Output verbose' }],
    examples: ['status -v'],
    usage: 'status -v',
    action(_, { verbose }) {
      const msg = `On branch master
      Your branch is up to date with 'origin/master'.
      
      Changes not staged for commit:
        (use "git add <file>..." to update what will be committed)
        (use "git restore <file>..." to discard changes in working directory)
        modified:   main.ts
      
      Untracked files:
        (use "git add <file>..." to include in what will be committed)
        ../with-tools/
      
      no changes added to commit (use "git add" and/or "git commit -a")`;

      if (verbose) {
        console.log(msg);
      } else {
        console.log(msg.replace(/\n/g, ''));
      }
    },
  }
);
