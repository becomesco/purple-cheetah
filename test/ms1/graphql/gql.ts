import {
  QLEntry,
  QLEntryPrototype,
  QLObjectPrototype,
  QLInputPrototype,
  QLResolverPrototype,
} from '../../../src';
import { TestObject } from './objects/test';

@QLEntry({
  inputs: [],
  objects: [new TestObject()],
  resolvers: [],
})
export class QLTest implements QLEntryPrototype {
  objects: QLObjectPrototype[];
  inputs: QLInputPrototype[];
  resolvers: QLResolverPrototype[];
}
