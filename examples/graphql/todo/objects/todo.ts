import { createGraphqlObject } from '../../../../src';

export const TodoObject = createGraphqlObject({
  name: 'Todo',
  fields: [
    {
      name: '_id',
      type: 'String!'
    },
    {
      name: 'createdAt',
      type: 'Float!'
    },
    {
      name: 'updatedAt',
      type: 'Float!'
    },
    {
      name: 'name',
      type: 'String!'
    },
    {
      name: 'description',
      type: 'String!'
    },
    {
      name: 'completed',
      type: 'Boolean!'
    },
  ]
})
