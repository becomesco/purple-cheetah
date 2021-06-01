import { createGraphqlResolver } from '../../../../src';
import { GraphqlResolverType, HTTPStatus } from '../../../../src/types';
import { TodoRepository } from '../repository';

export const TodoDeleteResolver = createGraphqlResolver<
  boolean,
  { id: string }
>({
  name: 'delete',
  type: GraphqlResolverType.MUTATION,
  return: {
    type: 'Boolean',
  },
  args: {
    id: 'String!',
  },
  async resolve({ id, __errorHandler, __resolverName, __logger }) {
    const item = await TodoRepository.findById(id);
    if (!item) {
      throw __errorHandler.occurred(
        HTTPStatus.NOT_FOUNT,
        `Todo with ID "${id}" does not exist.`,
      );
    }
    try {
      return await TodoRepository.deleteById(id);
    } catch (e) {
      __logger.error(__resolverName, e);
      throw __errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        'Failed to remove Model item from the database.',
      );
    }
  },
});
