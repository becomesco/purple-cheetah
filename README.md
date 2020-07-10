# Purple Cheetah

![Logo](https://i.imgur.com/f2Mv4QD.png)

[![npm](https://nodei.co/npm/@becomes/purple-cheetah.png)](https://www.npmjs.com/package/@becomes/purple-cheetah)

Purple Cheetah is a lightweight utility set written in Typescript for ExpressJS, meant for building Web APIs (REST and GraphQL). You are probably thinking: Not another javascript framework! And we agree with you. Purple Cheetah was developed to resolve issues in our company and give us tools with small amount of external dependencies. Simply put, Purple Cheetah is not a general purpose framework like NestJS, but it is a utility set for improving the process of building Web APIs.

## Get Started

- Install Purple Cheetah CLI tool: `npm i -g @becomes/purple-cheetah-cli`
- Using CLI tool create new project: `becomes-pcc --name hello-world`
- Navigate to project, run `npm run dev` and in the browser goto `localhost:1280`
- Done.

## API Reference

You can see full API Reference at https://shbsrbd.com/purple-cheetah/api.

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