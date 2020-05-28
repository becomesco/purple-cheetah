import { QLObject, QLObjectPrototype, QLFieldPrototype } from '../../../../src';

@QLObject({
  name: 'testt',
  type: 'Test',
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
