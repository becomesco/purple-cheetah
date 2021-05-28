import {
  createController,
  createControllerMethod,
  useObjectUtility,
} from '../../../src';
import { AddTodoData, AddTodoDataSchema, Todo } from '../models';
import { TodoRepository } from '../repositories';
import { HTTPStatus } from '../../../src/types';

const objectUtil = useObjectUtility();

export const TodoController = createController({
  name: 'Todo Controller',
  path: '/todo',
  methods: [
    createControllerMethod({
      name: 'get all',
      type: 'get',
      path: '',
      async handler(): Promise<{ items: Todo[] }> {
        return {
          items: await TodoRepository.findAll(),
        };
      },
    }),
    createControllerMethod({
      name: 'get by ID',
      type: 'get',
      path: '/:id',
      async handler({ request, errorHandler }): Promise<{ item: Todo }> {
        const item = await TodoRepository.findById(request.params.id);
        if (!item) {
          throw errorHandler.occurred(
            HTTPStatus.NOT_FOUNT,
            `Todo with ID "${request.params.id}" does not exist.`,
          );
        }
        return { item };
      },
    }),
    createControllerMethod({
      name: 'add',
      type: 'post',
      path: '',
      async handler({
        request,
        errorHandler,
        logger,
        name,
      }): Promise<{ item: Todo }> {
        {
          const result = objectUtil.compareWithSchema(
            request.body,
            AddTodoDataSchema,
            'body',
          );
          if (!result.ok) {
            throw errorHandler.occurred(HTTPStatus.BAD_REQUEST, result.error);
          }
        }
        const body: AddTodoData = request.body;
        try {
          const item = await TodoRepository.add({
            _id: '',
            createdAt: 0,
            updatedAt: 0,
            name: body.name,
            description: body.description,
            completed: false,
          });
          return { item };
        } catch (e) {
          logger.error(name, e);
          throw errorHandler.occurred(
            HTTPStatus.INTERNAL_SERVER_ERROR,
            'Failed to add item to the database',
          );
        }
      },
    }),
    createControllerMethod({
      name: 'update',
      type: 'put',
      path: '',
      async handler({ request }) {},
    }),
  ],
});
