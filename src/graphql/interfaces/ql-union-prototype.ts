import { QLObjectPrototype } from './ql-object-prototype';

export interface QLUnionPrototype {
  wrapperObject?: QLObjectPrototype;
  name: string;
  types: string[];
}
