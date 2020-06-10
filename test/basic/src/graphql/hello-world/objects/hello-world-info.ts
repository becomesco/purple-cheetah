import {
  QLObjectPrototype,
  QLFieldPrototype,
  QLObject,
} from '../../../../../../src';

export interface HelloWorldInfo {
  name: string;
  link: string;
}

@QLObject({
  name: 'HelloWorldInfo',
})
export class HelloWorldInfoObject implements QLObjectPrototype {
  name: string;
  type?: string;
  fields: QLFieldPrototype[] = [
    {
      name: 'name',
      type: 'String!',
    },
    {
      name: 'link',
      type: 'String!',
    },
  ];
  description?: string;
  wrapperObject?: QLObjectPrototype;
}
