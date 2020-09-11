# Purple Cheetah

![Logo](https://i.imgur.com/f2Mv4QD.png)

[![npm](https://nodei.co/npm/@becomes/purple-cheetah.png)](https://www.npmjs.com/package/@becomes/purple-cheetah)

Purple Cheetah is not a framework but rather a utility set for [ExpressJS](https://expressjs.com/), written in [Typescript](https://www.typescriptlang.org/). It was developed to resolve issues in our company and give us tools with small amount of external dependencies for creating Web APIs (REST and/or GraphQL).

## Get Started using CLI

- Install Purple Cheetah CLI tool: `npm i -g @becomes/purple-cheetah-cli`
- Using CLI tool create new project: `becomes-pcc --name hello-world`
- Navigate to project, run `npm run dev` and in the browser goto `localhost:1280`
- Done.

## Get started hard way

- Create a typescript project and install Purple Cheetah: `npm i --save @becomes/purple-cheetah`,
- Install [nodemon](): `npm i -D nodemon`,
- In the `src` directory create files called `main.ts` and `app.ts`,

```ts
// app.ts

import {PurpleCheetah, Application} from '@becomes/purple-cheetah';

@Application({
      port: process.env.PORT ? parseInt(process.env.PORT, 10) : 1280;
      controllers: [],
      middleware: [],
})
export class App extends PurpleCheetah {}
```

```ts
// main.ts

import { App } from './app.ts';

let app: App;

async function initialize() {
  // Do some initialization before starting the App
}
initialize()
  .then(() => {
    app = new App();
    app.listen();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export const Application = app;
```

```json
// package.json

{
  "scripts": {
    "dev": "nodemon src/main.ts"
    // ...
  },
  "nodemonConfig": {
    "watch": ["src"],
    "ext": "ts"
  }
}
```

After this you are ready to start the application by running `npm run dev`.

## API Reference

You can see full API Reference at https://purple-cheetah.dev/api.

Purple Cheetah API is not very big and complex. It will solve only common problems and help you write less boilerplate code. Altho you can use it in Javascript project, you will have much better experience using Typescript since it is designed for it.

## Example

Let's create a REST and GraphQL APIs that will return `hello world` as a result. In the project we will create a structure like shown:

```txt
 src
  └--- main.ts
  └--- app.ts
  └--- hello-world
        └--- controller.ts
        └--- request-handler.ts
        └--- gql
              └--- hello-world.ts
              └--- resolvers
                    └--- get.ts
```

You can structure your project as you wish, this is just the approach that we like to use.
