import { createGraphqlInput } from '../../../../src';

export const TodoUpdateData = createGraphqlInput({
  name: 'TodoUpdateData',
  fields: {
    _id: 'String!',
    name: 'String',
    description: 'String',
    completed: 'Boolean',
    type: 'TodoType',
  },
});
