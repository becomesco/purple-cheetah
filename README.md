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

**This example can be found on [Github.](https://github.com/becomesco/purple-cheetah-hello-world)**

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
 .prettier
 app.env
 package.json
 package-lock.json
 tsconfig.json
 tslint.json
```

_For more info about files visit [Github.](https://github.com/becomesco/purple-cheetah-hello-world)_

You can structure your project as you wish, this is just the approach that we like to use. Now inside of the `package.json` we will add 3 scripts:

```json
{
  "scripts": {
    "start": "node dist/main.js",
    "dev": "env-cmd -f app.env nodemon src/main.ts",
    "build": "tsc -p ."
  }
}
```

Lets get started by creating application object in `app.ts`.

```ts
// app.ts

import { Application, PurpleCheetah } from '@becomes/purple-cheetah';

@Application({
  port: parseInt(process.env.PORT, 10),
  controllers: [],
  middleware: [],
})
export class App extends PurpleCheetah {}
```

With this done we have minimum requirements for the application to start. To start the application we will create `main.ts` file and inside of it create a new instance of the application and expose it to the end user.

```ts
// main.ts

import { App } from './app';

let app: App;

async function initialize() {
  // Do some initialization before starting the app
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

export const application = app;
```

Now if we start application in development by running `npm run dev`, open browser and goto `localhost:1280` we will be prompted with a JSON response telling us that requested endpoint does not exist. This is Purple Cheetahs default error handling for 404 error. You can add custom 404 handler by creating a middleware and passing its instance to `notFoundMiddleware` property of `Application` decorator.

Let us continue with creating the controller. Inside of a `hello-world` directory we will create 3 files: `index.ts`, `controller.ts` and `request-handler.ts`. This file names are a best practice but you can call them what ever suits you the best.

- `index.ts` - will expose sibling files and directories to its parent directory,
- `controller.ts` - is a route handler and,
- `request-handler.ts` - is a logic implementation for a given controller.

Altho you can but handler logic inside of a controller it is recommended to separate them. This will prove useful later when we start working on a GraphQL implementation.

Inside of the `index.ts` we will expose `controller.ts` and `request-handler.ts`.

```ts
// hello-world/index.ts

export * from './controller';
export * from './request-handler';
```

Logic for this controller is to have 2 routes. One is `/hello-world` which will return a message `Hello World!` and other is `/hello/:name` which will return a message `Hello ${name}!`. First we will implement the logic in `request-handler.ts`.

```ts
export class HelloWorldRequestHandler {
  public static sayHelloWorld(): string {
    return 'Hello World!';
  }
  public static greetPerson(name: string): string {
    return `Hello ${name}!`;
  }
}
```

This is very simple logic but good for demonstrating how everything works. How more complex stuff visit [SHBSRBD Tutorials](https://shbsrbd.com/blog/group/purple-cheetah) on topic of Purple Cheetah. With this done, lets implement routes for controller.

```ts
import {
  Controller,
  ControllerPrototype,
  Get,
  Logger,
} from '@becomes/purple-cheetah';
import { Request, Router } from 'express';
import { HelloWorldRequestHandler } from './request-handler';

@Controller()
export class HelloWorldController implements ControllerPrototype {
  baseUri: string;
  initRouter: any;
  logger: Logger;
  name: string;
  router: Router;

  @Get('/hello-world')
  async sayHelloWorld(request: Request): Promise<{ message: string }> {
    return {
      message: HelloWorldRequestHandler.sayHelloWorld(),
    };
  }

  @Get('/hello/:name')
  async greetPerson(request: Request): Promise<{ message: string }> {
    return {
      message: HelloWorldRequestHandler.greetPerson(request.params.name),
    };
  }
}
```

It is time to add this controller to the application and see the results. We will do this by adding new instance of the `HelloWorldController` to a controller property on the `Application` decorator.

```ts
import { Application, PurpleCheetah } from '@becomes/purple-cheetah';
import { HelloWorldController } from './hello-world';

@Application({
  port: parseInt(process.env.PORT, 10),
  controllers: [new HelloWorldController()],
  middleware: [],
})
export class App extends PurpleCheetah {}
```