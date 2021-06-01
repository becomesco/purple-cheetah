import { createGraphqlInput } from '../../../../src';

export const TodoAddDataInput = createGraphqlInput({
  name: 'TodoAddData',
  fields: [
    {
      name: 'name',
      type: 'String!',
    },
    {
      name: 'description',
      type: 'String!',
    },
  ],
});
