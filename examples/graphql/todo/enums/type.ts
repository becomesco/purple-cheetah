import { createGraphqlEnum } from '../../../../src';

export const TodoTypeEnum = createGraphqlEnum({
  name: 'TodoType',
  values: ['IMPORTANT', ]
})
