
# Core
> This is the core package for Zors, published under the name `zors`

## Installation
```shell
# with npm
npm install zors

# with yarn
yarn add zors

# with pnpm
pnpm add zors
```

## Quick Start Guide

To create a new program you can import the `zors` function, which takes in your a `name` and `version` 
which will be later used for automatic help generation. 

> Its recommended to keep your program name same as the `bin` name in your `package.json`

```ts
import { zors } from 'zors';

const name = 'my-git';
const version = '1.0.0';

const program = zors(name, version);
```

You can use the `.command()` method to create a new [`Command`]() which takes in a some `raw` input and `description` parameters along with an optional [`config`](###command-config) object

```ts
program
  .command('init', 'Initialize an empty git repository')
```

Every command can define some options, you can add one using `.option()` method on any command object. Which also takes in a `raw` input and `description`.

> options and arguments with angled `<>` brackets are treated as required and will be validated, where as square `[]` brackets are treated as optional. 

If neither of these are used, an option is treated as a `boolean` by default.

```ts
program
  .command('init', 'Initialize an empty git repository')
  .option('-q, --quiet', 'Only print error and warning messages; all other output will be suppressed.')
  .option('-t, --template <template directory>', 'Specify the directory from which templates will be used.')
```

Every command needs to have an `action` defined, action is just a function which is executed with some arguments when the command is called.

You can define an action using the `.action()` method on any command, whose parameters are `args`, `options` and `tools` respectively.

```ts
program
  .command('init', 'Initialize an empty git repository')
  .option('-q, --quiet', 'Only print error and warning messages; all other output will be suppressed.')
  .option('-t, --template <template directory>', 'Specify the directory from which templates will be used.')
  .action((args, options, tools) => {

    if (!options.quiet) {
      console.log("Initialized an empty git repository")
    }

    if (options.template) {
      console.log("used template: ", options.template)
    }

    process.exit(0) 
  })
```

**That's all you need to create a basic CLI app**, 

Let's try running it. In Node to get the standard input `argv` we can use `process.argv` and use `.slice(2)` ignore the first 2 items in the array as they're of no use to us. 

```ts
await program.run(process.argv.slice(2))
```

## API Reference

We rely on Typescript types to auto-generate API documentation [find it here](https://paka.dev/npm/zors)