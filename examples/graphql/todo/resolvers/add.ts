import { createGraphqlResolver } from '../../../../src';
import { GraphqlResolverType, HTTPStatus } from '../../../../src/types';
import type { TodoAddData, TodoModel } from '../model';
import { TodoRepository } from '../repository';

export const TodoAddResolver = createGraphqlResolver<
  TodoModel,
  {
    data: TodoAddData;
  }
>({
  name: 'add',
  type: GraphqlResolverType.MUTATION,
  return: {
    type: 'Todo',
  },
  args: {
    data: 'TodoAddData',
  },
  async resolve({ data, __logger, __errorHandler, __resolverName }) {
    console.log(data);
    try {
      return await TodoRepository.add({
        _id: '',
        createdAt: 0,
        updatedAt: 0,
        name: data.name,
        description: data.description,
        completed: false,
        type: data.type,
      });
    } catch (e) {
      __logger.error(__resolverName, e);
      throw __errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        'Failed to add item to the database',
      );
    }
  },
});
