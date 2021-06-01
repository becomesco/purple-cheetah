import { createGraphqlObject } from '../../../../src';

export const TodoObject = createGraphqlObject({
  name: 'Todo',
  fields: {
    _id: 'String',
    createdAt: 'Float!',
    updatedAt: 'Float!',
    name: 'String!',
    description: 'String!',
    type: 'TodoType!',
    completed: 'Boolean!',
  },
});
