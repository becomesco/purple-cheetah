import { createGraphqlResolver } from '../../../../src';
import { GraphqlResolverType } from '../../../../src/types';
import { TodoRepository } from '../repository';

export const TodoGetAllResolver = createGraphqlResolver({
  name: 'getAll',
  type: GraphqlResolverType.QUERY,
  return: {
    type: 'TodoArray',
  },
  async resolve() {
    return await TodoRepository.findAll();
  },
});
