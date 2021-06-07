# Purple Cheetah

![Logo](https://i.imgur.com/f2Mv4QD.png)

[![NPM Version][npm-image]][npm-url]

Purple Cheetah is not a framework but rather a utility set for [ExpressJS](https://expressjs.com/), written in [Typescript](https://www.typescriptlang.org/). It was developed to resolve issues in our company and give us tools with a small amount of external dependencies for creating Web APIs (REST and/or GraphQL).

## Table of contents

- [Versioning](#versioning)
- [Get started](#get-started)
- [Create Purple Cheetah](#creating-purple-cheetah-application)

## Versioning

It is important to know how Purple Cheetah package versions work. All versions are annotated as `x.y.z` where:

- `x` - indicates a major version of the package. This number between versions indicates that there are some braking changes in the package.
- `y` - indicates if a package is a stable production ready version, or a development version, and it can only be 0 or 1.
  - **1** - stable production ready (ex. `2.1.12`)
  - **0** - development (ex. `2.0.32`)
- `z` - indicates a minor version of the package. Changes to this parameter indicates only audits, performance improvements and some overall improvements that do not have effect on package usage.

## Get started

- Easiest way to get started is to clone the starter github repository: `git clone git@github.com:becomesco/purple-cheetah-starter`.
- Install the project dependencies by running: `npm i`.
- With this completed, development server can be started by running: `npm run dev`.
- By opening a browser and going to **http://localhost:1280/hello/world**, JSON response from the server can be seen.

## Creating Purple Cheetah application

To create Express application powered by Purple Cheetah tool set, `createPurpleCheetah` function is used. This is also the main entry point for the application which is used to configure it. Application configuration is pretty simple. There are 4 important properties in configuration object:

- `port` - Specify the port on which server Express server will be available,
- `controllers` - Array of controller objects which will be mounted in order,
- `middleware` - Array of middleware object which will be mounted in order,
- `modules` - Array of module objects which will be mounted in order,

[npm-image]: https://img.shields.io/npm/v/@becomes/purple-cheetah.svg
[npm-url]: https://npmjs.org/package/@becomes/purple-cheetah
