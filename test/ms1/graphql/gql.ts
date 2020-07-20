import {
  QLEntry,
  QLEntryPrototype,
  QLObjectPrototype,
  QLInputPrototype,
  QLResolverPrototype,
  QLUnionPrototype,
  QLResponseFactory,
} from '../../../src';
import { TestObject, Test2Object } from './objects';
import { GetTestResolver } from './resolvers/get';
import { TestUnion } from './unions';

@QLEntry({
  objects: [
    new TestObject(),
    new Test2Object(),
    QLResponseFactory.create('TestUnion', '[TestUnion!]').object,
  ],
  resolvers: [new GetTestResolver()],
  unions: [new TestUnion()],
})
export class QLTest implements QLEntryPrototype {
  unions: QLUnionPrototype[];
  resolvers: Array<QLResolverPrototype<any>>;
  objects: QLObjectPrototype[];
  inputs: QLInputPrototype[];
}
