import { createGraphqlResolver } from '../../../../src';
import { GraphqlResolverType, HTTPStatus } from '../../../../src/types';
import type { TodoModel, TodoUpdateData } from '../model';
import { TodoType } from '../model';
import { TodoRepository } from '../repository';

export const TodoUpdateResolver = createGraphqlResolver<
  TodoModel,
  {
    data: TodoUpdateData;
  }
>({
  name: 'update',
  type: GraphqlResolverType.MUTATION,
  args: {
    data: 'TodoUpdateData',
  },
  return: { type: 'Todo' },
  async resolve({ data, __errorHandler, __logger, __resolverName }) {
    const item = await TodoRepository.findById(data._id);
    if (!item) {
      throw __errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        `Todo with ID "${data._id}" does not exist`,
      );
    }
    let changes = false;
    if (typeof data.name === 'string') {
      changes = true;
      item.name = data.name;
    }
    if (typeof data.description === 'string') {
      changes = true;
      item.description = data.description;
    }
    if (typeof data.completed === 'boolean') {
      changes = true;
      item.completed = data.completed;
    }
    if (typeof data.type === 'string') {
      if (!TodoType[data.type]) {
        throw __errorHandler.occurred(
          HTTPStatus.BAD_REQUEST,
          `Type "${data.type}" is not valid.`,
        );
      }
      changes = true;
      item.type = TodoType[data.type];
    }
    if (!changes) {
      throw __errorHandler.occurred(
        HTTPStatus.BAD_REQUEST,
        'Nothing to update',
      );
    }
    try {
      return await TodoRepository.update(item);
    } catch (e) {
      __logger.error(__resolverName, e);
      throw __errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        'Failed to updated Model in the database.',
      );
    }
  },
});
