# Purple Cheetah

![Logo](https://i.imgur.com/f2Mv4QD.png)

[![NPM Version][npm-image]][npm-url]

## Introduction

Purple Cheetah is not a framework but rather a utility set for [ExpressJS](https://expressjs.com/), written in [Typescript](https://www.typescriptlang.org/). It was developed to resolve issues in our company and give us tools with a small amount of external dependencies for creating Web APIs (REST and/or GraphQL).

## Table of contents

- [Versioning](#versioning)
- [Getting started](#getting-started)
- [Creating Purple Cheetah application](#creating-purple-cheetah-application)
- [Controller](#controller)
  - [Controller setup](#controller-setup)
  - [Pre request handler](#pre-request-handler)
- [Middleware](#middleware)
- [Modules](#modules)

## Versioning

It is important to know how Purple Cheetah package versions work. All versions are annotated as `x.y.z` where:

- `x` - indicates a major version of the package. This number between versions indicates that there are some braking changes in the package.
- `y` - indicates if a package is a stable production ready version, or a development version, and it can only be 0 or 1.
  - **1** - stable production ready (ex. `3.1.12`)
  - **0** - development (ex. `3.0.32`)
- `z` - indicates a minor version of the package. Changes to this parameter indicates only audits, performance improvements and some overall improvements that do not have effect on package usage.

## Getting started

- The Easiest way to get started is to clone the starter GitHub repository: `git clone git@github.com:becomesco/purple-cheetah-starter`.
- Install the project dependencies by running: `npm i`.
- With this completed, development server can be started by running: `npm run dev`.
- By opening a browser and going to **http://localhost:1280/hello/world**, JSON response from the server can be seen.

## Creating Purple Cheetah application

To create Express application powered by Purple Cheetah tool set, `createPurpleCheetah` function is used. This is also the main entry point for the application which is used to configure it. Application configuration is pretty simple. There are 4 important properties in configuration object (see Snippet 1):

- `port` - Specify the port on which Express server will be available,
- `controllers` - Array of controller objects which will be mounted in order,
- `middleware` - Array of middleware object which will be mounted in order,
- `modules` - Array of module objects which will be mounted in order,

```ts
const app = createPurpleCheetah({
  port: 1280,
  modules: [
    /* List of modules */
  ],
  controllers: [
    /* List of controllers */
  ],
  middleware: [
    /* Middleware list */
  ],
});
```

_Snippet 1 - Create a Purple Cheetah application._

This will be explained in more detail.

- First step is mounting [modules](#modules). They are mounded in FIFO order and once 1 module is mounted, it will trigger a callback which will mount the next module, and so on.
- With all modules mounted, if `start` function is present in the configuration, it will be called.
- Next step is mounting [middleware](#middleware) objects which have flag **after** equal to _false_.
- After that, is `middle` function is present in the configuration, it will be called.
- In next step, all [controller](#controller) objects will be mounted in FIFO order.
- With all controllers mounted successfully, all middleware objects, with flag **after** equal to _true_, will be mounted.
- If `finalize` function is present in the configuration, it will be called.
- With all above steps completed successfully, HTTP server will be started, and it will print message like one shown below:

```text
Purple Cheetah - Started Successfully
-------------------------------------
PORT: 1280
PID: 24720
TTS: 0.007s
```

## Controller

Most important tools for creating REST APIs are tools for connecting HTTP
requests with some business logic, doing a required work and creating a
response. This is as easy as creating an HTTP route handler for specified
method. In pure Express application this could be done like shown in Snippet 2.

```ts
app.get('/user', (request, response) => {
  // Get user from the database
  // ...
  response.json(user);
});
```

_Snippet 2 - Creating an endpoint using ExpressJS_

This is all very nice but writing a code this way can be messy and organizing it can be a challenge. Because of this, abstracts like Controller, Controller method and Middleware exist in the Purple Cheetah tool set. In this section, Controller abstract will be covered.

Controller is an abstraction which provides clean and unified way for creating a group of REST endpoints. Controller object is created by calling `createController` function which accepts configuration object as a parameter. Controller by itself if just a _"placeholder"_ and does not hold any complex logic. To implement a logic, and to add REST endpoints, Controller method is used.

By using the Purple Cheetah Controller approach, code from Snippet 2 can be rewritten lite shown in Snippet 3.

```ts
const UserController = createController({
  name: 'User',
  path: '/user',
  methods() {
    return {
      getUser: createControllerMethod<unknown, User>({
        type: 'get',
        async handler() {
          // Get user from the database
          // ...
          return user;
        },
      }),
    };
  },
});
```

_Snippet 3 - Create an endpoint using the Purple Cheetah controller/method approach._

Much more code is written in Snippet 3 compared to 2, so why is this better? Second example provides structure, consistency (which is not easy to spot on such a short example) and unified way to create REST endpoints. This means that navigation in project is much quicker, and it is easier to understand what is the end result of each endpoint. In addition to that, return type of the method can be specified.

### Controller setup

Setup is a method inside of the controller configuration object which is called when a controller is mounted. It can be asynchronous and it is designed to some work with will be required for all (or majority) of method in specified controller. Output from the setup method is piped into methods and made available in that way.

```ts
const MyController = createController<{ baseMessage: string }>({
  name: 'My controller',
  path: '/hello',
  setup() {
    return {
      baseMessage: 'Hello, ',
    }
  }
  methods({ baseMessage }) {
    return {
      world: createControllerMethod<unknown, { message: string }>({
        path: '/:name',
        type: 'get',
        async handler({ request }) {
          return {
            message: `${baseMessage}${request.params.name}`
          };
        },
      }),
    };
  },
});
```

_Snippet 4 - Setup method in a controller_

Code from Snippet 4 is trivial but it illustrates how the setup methods works and how it is used. Some more relevant example would be to get security keys from other application which are required in controller methods.

### Pre request handler

It is a method inside of a Controller Method configuration object. It is executed before each required to specified route and output from it is piped to handler method. Example for Snippet 4 can be modified to use pre request handler to which will convert a first letter of request parameter in upper-case like shown in Snippet 5.

```ts
const MyController = createController<{ baseMessage: string }>({
  name: 'My controller',
  path: '/hello',
  setup() {
    return {
      baseMessage: 'Hello, ',
    }
  }
  methods({ baseMessage }) {
    return {
      world: createControllerMethod<{ name: string }, { message: string }>({
        path: '/:name',
        type: 'get',
        async preRequestHandler({request}) {
          return {
            name: 
              request.params.name.substring(0, 1).toUpperCase 
              + request.params.name.substring(1).toLowerCase(),
          }
        }
        async handler({ name }) {
          return {
            message: `${baseMessage}${name}`
          };
        },
      }),
    };
  },
});
```

_Snippet 5 - Controller method pre request handler_

Again, example from Snippet 5 is trivial but it illustrates how pre request handler is used. As it can be seen, pre request handler functions like a [middleware](#middleware) but only for specific route. It is useful when different routes use different mechanisms for security and resource protection.

## Middleware

Middleware is similar to a controller, but it is usually used to transform
incoming or outgoing data in some shape or form. Because of this, middleware is
triggered for all methods on all routes which are starting with a specified
path.

Like the `createController` function, `createMiddleware` function returns the
_Middleware_ object which is used in Purple Cheetah configuration object in the
middleware array property. Example for creating a middleware object is shown in
Snippet 6.

```ts
createMiddleware({
  name: 'Test middleware',
  path: '/test',
  handler() {
    return async () => {
      // Middleware logic.
    };
  },
});
```

_Snippet 6 - Creating a simple middleware object._

It is important to know that handler method can be asynchronous and will be called only once when the middleware is mounted. So before returning a request handler function, setup of the middleware can be done.

Purple Cheetah comes with few predefined middleware objects:

- Body parser - Is a middleware which uses the functionality of
  the [body-parser](https://www.npmjs.com/package/body-parser) package. This
  middleware is not added to the Purple Cheetah application by default. To add
  it to the application, call `createBodyParserMiddleware` in middleware array
  of the Purple Cheetah configuration object.
- CORS - Is a middleware which uses the functionality of
  the [cors](https://www.npmjs.com/package/cors) package. This middleware is not
  added to the Purple Cheetah application by default. To add it to the
  application, call `createCorsMiddleware` in middleware array of the Purple
  Cheetah configuration object.
- HTTP exception handler - Is a simple middleware which checks if
  the [next function](https://expressjs.com/en/4x/api.html#router.use) was
  called with error. If the error is of type _HttpException_, error payload will
  be sent to the client, and warning log message will be printed. If the error
  is the native JavaScript error, error log message will be printed and the
  client will receive response with status 500 and no details. This middleware
  is added to the Purple Cheetah by default and can be overwritten in the
  configuration object.
- Route not found (404) - Is a simple middleware which return JSON object to
  the client if requested route does not exist. This middleware is added to the
  Purple Cheetah by default and can be overwritten in the configuration object.
- Request logger - Is a simple middleware which uses logger to log all incoming
  requests. This middleware is not added to the Purple Cheetah application by
  default. To add it to the application, call `createRequestLoggerMiddleware` in
  middleware array of the Purple Cheetah configuration object.

## Modules

Module is the core abstract in the Purple Cheetah which allows external code to
access the pipe. Modules are passed to the configuration object in `modules`
array.

To learn more about modules visit [modules repository](https://github.com/becomesco/purple-cheetah-modules)

[npm-image]: https://img.shields.io/npm/v/@becomes/purple-cheetah.svg
[npm-url]: https://npmjs.org/package/@becomes/purple-cheetah
