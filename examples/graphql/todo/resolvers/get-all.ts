import { createGraphqlResolver } from '../../../../src';
import { GraphqlResolverType } from '../../../../src/types';
import { TodoRepository } from '../repository';

export const TodoGetAllResolver = createGraphqlResolver({
  name: 'todoGetAll',
  type: GraphqlResolverType.QUERY,
  returnType: 'TodoArray',
  async resolver() {
    const result = await TodoRepository.findAll();
    console.log(result);
    return result;
  },
});
