import {
  QLObjectPrototype,
  QLFieldPrototype,
  QLObject,
} from '../../../../../../src';
import { HelloWorldInfo } from './hello-world-info';

export interface HelloWorld {
  message: string;
  info: HelloWorldInfo[];
}

@QLObject({
  name: 'HelloWorld',
})
export class HelloWorldObject implements QLObjectPrototype {
  name: string;
  type?: string;
  fields: QLFieldPrototype[] = [
    {
      name: 'message',
      type: 'String!',
    },
    {
      name: 'info',
      type: '[HelloWorldInfo!]!',
    },
  ];
  description?: string;
  wrapperObject?: QLObjectPrototype;
}
