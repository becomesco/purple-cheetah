import { createController, createControllerMethod } from '../../src';

export const HelloWorldController = createController<{ prefix: string }>({
  name: 'Hello World',
  path: '/hello',
  setup() {
    return {
      prefix: 'Hello',
    };
  },
  methods({ prefix }) {
    return {
      world: createControllerMethod<unknown, { message: string }>({
        path: '/world',
        type: 'get',
        async handler() {
          return {
            message: `${prefix} World!`,
          };
        },
      }),
      name: createControllerMethod<unknown, { message: string }>({
        path: '/:name',
        type: 'get',
        async handler({ request }) {
          return {
            message: `${prefix} ${request.params.name}!`,
          };
        },
      }),
    };
  },
});
