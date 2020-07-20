import { QLObjectPrototype } from './ql-object-prototype';
import { QLInputPrototype } from './ql-input-prototype';
import { QLResolverPrototype } from './ql-resolver-prototype';
import { QLUnionPrototype } from './ql-union-prototype';
import { QLEnumPrototype } from './ql-enum-prototype';

export interface QLEntryPrototype {
  objects: QLObjectPrototype[];
  inputs: QLInputPrototype[];
  resolvers: Array<QLResolverPrototype<any>>;
  unions: QLUnionPrototype[];
  enums?: QLEnumPrototype[];
}
