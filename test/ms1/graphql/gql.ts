import {
  QLEntry,
  QLEntryPrototype,
  QLObjectPrototype,
  QLInputPrototype,
  QLResolverPrototype,
} from '../../../src';
import { TestObject } from './objects/test';
import { GetTestResolver } from './resolvers/get';

@QLEntry({
  inputs: [],
  objects: [new TestObject()],
  resolvers: [new GetTestResolver()],
})
export class QLTest implements QLEntryPrototype {
  resolvers: Array<QLResolverPrototype<any>>;
  objects: QLObjectPrototype[];
  inputs: QLInputPrototype[];
}
