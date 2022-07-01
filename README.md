# Zors 🥇🥈🥉

> A next-gen framework for type-safe command-line applications

- 💡 Runtime agonistic (works on both Deno and Node JS)
- 🛠️ Rich Features (Automatic help generation, dot-nested options, external commands)
- 📦 Tiny (zero dependencies)
- 🔩 Rich Plugin Interface
- 🔑 Fully Typed APIs

## **THIS PROJECT IS IN BETA**
> We're actively working on bug fixes, improvements and documentation to get this released ASAP.

## Quick Start Guide

1. install `zors`

```bash
# to install using npm
npm install zors

# to install with yarn
yarn add zors

# to install with pnpm
pnpm install zors
```

2. importing `zors` and creating a new `program` instance and then we can start adding commands to it.

```ts
// main.ts
import { zors } from 'zors';

const name = 'my-git';
const version = '1.0.0';
const program = zors(name, version);
```

3. Let's replicate the `git add` command, which accepts a list of files to add to the staging area or it also can add all the changes using `git add .`

```ts
program
  .command<string[]>("add <...files>", "Add files to track")
  .action((files) => {
    if (files.length === 1 && files[0] === '.') {
      console.log(`Tracking all files`);
    } else {
      console.log(`Tracking files: `, files);
    }
  });

program.run(process.argv.slice(2));
```

Usage -

<img src="https://cdn.discordapp.com/attachments/992276677398892617/992388499112198184/unknown.png" width="500px"/>

4. Setting options for commands.

```ts
program
  .command<undefined, { commit: boolean }>(
    'init',
    'Initialize an empty git repository'
  )
  .option('-c, --commit', 'stage files and create an initial commit')
  .action((_, { commit }) => {
    console.log(`Intialized an empty git repository`);
    if (commit) {
      console.log(`Created an initial commit`);
    }
  })

program.run(process.argv.slice(2));
```

Usage -

<img src="https://cdn.discordapp.com/attachments/992276677398892617/992388947764334642/unknown.png" width="500px"/>

## Displaying help message

```ts
// help.ts
program.
  help()
// call the help() method on the program object
// this will display help message whenever 
// -h or --help flag is passed 
// or even if just the name of the program is entered

program.run(process.argv.slice(2));
```

<!--* For image sid will show some bin thing in package.json -->

## Keeping separate files for each command

If your program's size is greater you should definitely consider code splitting. Here you can use the `program.register()` method to add commands to the programs from different files.

```ts
// commands.ts
import { defineCommand } from 'zors';

export const addCommand = defineCommand<string[]>(
  'add <...files>',
  {
    description: "Adds files to track",
    examples: ["add fileName.txt", "add ."],
    action(files) {
      if (files.length === 1 && files[0] === '.') {
        console.log(`Tracking all files`);
      } else {
        console.log(`Tracking files: `, files);
      }
    }
  }
)

// main.ts
import zors from 'zors';
import { addCommand } from './commands/js';

const program = zors("my-git", "1.0.0");

program
  .register(addCommand);

program.run(process.argv.slice(2));
```

## API Reference

### The `zors` constructor

Takes three arguments name and versionNumber which are strict and a config object which isn't strict. 

```ts
constructor(
  name: string, // name of the program, example: git
  versionNumber: `${number}.${number}.${number}`, //version 
)