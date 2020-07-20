import { QLObject, QLObjectPrototype, QLFieldPrototype } from '../../../../src';

export interface Test2 {
  data2: string;
}

@QLObject({
  name: 'Test2',
})
export class Test2Object implements QLObjectPrototype {
  name: string;
  type?: string;
  fields: QLFieldPrototype[] = [
    {
      name: 'data2',
      type: 'String!',
    },
  ];
  description?: string;
  wrapperObject?: QLObjectPrototype;
}
