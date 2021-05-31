import type { GraphqlField } from './field';
import type { GraphqlArg } from './arg';

// eslint-disable-next-line no-shadow
export enum GraphqlResolverType {
  QUERY = 'QUERY',
  MUTATION = 'MUTATION',
}

export interface GraphqlResolverConfig<T> {
  name: string;
  type: GraphqlField;
  root: {
    args?: GraphqlArg[];
    returnType: string;
  };
  description?: string;
  resolver<K>(args: K): Promise<T>;
}
