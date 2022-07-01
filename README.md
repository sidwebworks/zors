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
npm install zors
yarn add zors
pnpm install zors
```

2. importing `zors` and creating a new `program` instance

```ts
import { zors } from '../dist/index.js';

const name = 'Test';
const version = '0.0.0';
const program = zors(name, version);
```

This will create a new program instance. Now you can start adding commands.

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
```

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
```
