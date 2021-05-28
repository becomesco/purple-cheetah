import { createController, createControllerMethod } from '../../src';

export const HelloWorldController = createController({
  name: 'Hello World',
  path: '/hello',
  methods: [
    createControllerMethod({
      name: 'world',
      path: '/world',
      type: 'get',
      async handler() {
        return {
          message: 'Hello World!',
        };
      },
    }),
    createControllerMethod({
      name: 'name',
      path: '/:name',
      type: 'get',
      async handler(data) {
        return {
          message: `Hello ${data.request.params.name}!`,
        };
      },
    }),
  ],
});
