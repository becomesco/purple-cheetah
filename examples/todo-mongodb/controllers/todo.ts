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
  methods: [
    createControllerMethod({
      name: 'get all',
      type: 'get',
      path: '/all',
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
    createControllerMethod<AddTodoData, { item: Todo }>({
      name: 'add',
      type: 'post',
      path: '',
      preRequestHandler:
        createBodyValidationPreRequestHandler(AddTodoDataSchema),
      async handler({ errorHandler, logger, name, pre }) {
        try {
          const item = await TodoRepository.add({
            _id: undefined as never,
            createdAt: 0,
            updatedAt: 0,
            name: pre.name,
            description: pre.description,
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
    createControllerMethod<UpdateTodoData, { item: Todo }>({
      name: 'update',
      type: 'put',
      path: '',
      preRequestHandler:
        createBodyValidationPreRequestHandler(UpdateTodoDataSchema),
      async handler({ errorHandler, pre, logger, name }) {
        const item = await TodoRepository.findById(pre._id);
        if (!item) {
          throw errorHandler.occurred(
            HTTPStatus.NOT_FOUNT,
            `Todo with ID "${pre._id}" does not exist`,
          );
        }
        let changes = false;
        if (typeof pre.name === 'string') {
          changes = true;
          item.name = pre.name;
        }
        if (typeof pre.description === 'string') {
          changes = true;
          item.description = pre.description;
        }
        if (typeof pre.completed === 'boolean') {
          changes = true;
          item.completed = pre.completed;
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
            'Failed to updated Todo in the database.',
          );
        }
      },
    }),
    createControllerMethod({
      name: 'remove',
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
            'Failed to remove Todo item from the database.',
          );
        }
      },
    }),
  ],
});
