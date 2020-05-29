import { QLObject, QLObjectPrototype, QLFieldPrototype } from '../../../../src';

export interface Test {
  input: string;
  data: string;
}

@QLObject({
  name: 'Test',
})
export class TestObject implements QLObjectPrototype {
  name: string;
  type?: string;
  fields: QLFieldPrototype[] = [
    {
      name: 'input',
      type: 'String!',
    },
    {
      name: 'data',
      type: 'String!',
    },
  ];
  description?: string;
  wrapperObject?: QLObjectPrototype;
}
