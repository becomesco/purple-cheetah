import { createGraphqlInput } from '../../../../src';

export const TodoAddDataInput = createGraphqlInput({
  name: 'TodoAddData',
  fields: {
    name: 'String!',
    description: 'String!',
    type: 'TodoType!',
  },
});
