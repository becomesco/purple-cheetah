import {
  QLEntryPrototype,
  QLObjectPrototype,
  QLInputPrototype,
  QLResolverPrototype,
  QLEntry,
} from '../../../../../src';
import { HelloWorldObject } from './objects/hello-world';
import { HelloWorldInfoObject } from './objects/hello-world-info';
import { HelloWorldResolver } from './resolvers/get';

@QLEntry({
  objects: [new HelloWorldObject(), new HelloWorldInfoObject()],
  resolvers: [new HelloWorldResolver()],
})
export class HelloWorldQL implements QLEntryPrototype {
  objects: QLObjectPrototype[];
  inputs: QLInputPrototype[];
  resolvers: Array<QLResolverPrototype<any>>;
}
