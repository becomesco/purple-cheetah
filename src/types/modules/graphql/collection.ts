import type { GraphqlObject } from './object';
import type { GraphqlInput } from './input';
import type { GraphqlEnum } from './enum';
import type { GraphqlUnion } from './union';
import type { GraphqlResolver } from './resolver';

export interface GraphqlCollectionConfig {
  name: string;
  objects?: GraphqlObject[];
  inputs?: GraphqlInput[];
  enums?: GraphqlEnum[];
  unions?: GraphqlUnion[];
  resolvers?: Array<GraphqlResolver<unknown>>;
}

export interface GraphqlCollection {
  name: string;
  objects: GraphqlObject[];
  inputs: GraphqlInput[];
  enums: GraphqlEnum[];
  unions: GraphqlUnion[];
  resolvers: Array<GraphqlResolver<unknown>>;
}
