import { QLObjectPrototype } from './ql-object-prototype';
import { QLInputPrototype } from './ql-input-prototype';
import { QLResolverPrototype } from './ql-resolver-prototype';

export interface QLEntryPrototype {
  objects: QLObjectPrototype[];
  inputs: QLInputPrototype[];
  resolvers: QLResolverPrototype[];
}
