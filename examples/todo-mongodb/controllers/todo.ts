import {
  createController,
  createControllerMethod,
  createBodyValidationPreRequestHandler,
} from '../../../src';
import {
  AddTodoData,
  AddTodoDataSchema,
  Todo,
  UpdateTodoData,
  UpdateTodoDataSchema,
} from '../models';
import { TodoRepository } from '../repositories';
import { HTTPStatus } from '../../../src/types';

export const TodoController = createController({
  name: 'Todo Controller',
  path: '/todo',
  methods() {
    return {
      getAll: createControllerMethod({
        type: 'get',
        path: '/all',
        async handler(): Promise<{ items: Todo[] }> {
          return {
            items: await TodoRepository.findAll(),
          };
        },
      }),
      getById: createControllerMethod({
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
      add: createControllerMethod<{ body: AddTodoData }, { item: Todo }>({
        type: 'post',
        path: '',
        preRequestHandler:
          createBodyValidationPreRequestHandler(AddTodoDataSchema),
        async handler({ errorHandler, logger, name, body }) {
          try {
            const item = await TodoRepository.add({
              _id: undefined as never,
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
      update: createControllerMethod<{ body: UpdateTodoData }, { item: Todo }>({
        type: 'put',
        path: '',
        preRequestHandler:
          createBodyValidationPreRequestHandler(UpdateTodoDataSchema),
        async handler({ errorHandler, body, logger, name }) {
          const item = await TodoRepository.findById(body._id);
          if (!item) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Todo with ID "${body._id}" does not exist`,
            );
          }
          let changes = false;
          if (typeof body.name === 'string') {
            changes = true;
            item.name = body.name;
          }
          if (typeof body.description === 'string') {
            changes = true;
            item.description = body.description;
          }
          if (typeof body.completed === 'boolean') {
            changes = true;
            item.completed = body.completed;
          }
          if (!changes) {
            throw errorHandler.occurred(
              HTTPStatus.BAD_REQUEST,
              'Nothing to update',
            );
          }
          try {
            return {
              item: await TodoRepository.update(item),
            };
          } catch (e) {
            logger.error(name, e);
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              'Failed to updated Model in the database.',
            );
          }
        },
      }),
      remove: createControllerMethod({
        type: 'delete',
        path: '/:id',
        async handler({ request, errorHandler, name, logger }) {
          const item = await TodoRepository.findById(request.params.id);
          if (!item) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `Todo with ID "${request.params.id}" does not exist.`,
            );
          }
          try {
            await TodoRepository.deleteById(request.params.id);
          } catch (e) {
            logger.error(name, e);
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              'Failed to remove Model item from the database.',
            );
          }
        },
      }),
    };
  },
});
