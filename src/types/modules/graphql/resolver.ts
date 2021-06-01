import type { GraphqlArg } from './arg';
import type { GraphqlResponse } from './response';

// eslint-disable-next-line no-shadow
export enum GraphqlResolverType {
  QUERY = 'QUERY',
  MUTATION = 'MUTATION',
}
export type GraphqlResolverFunction<T, K> = (args: K) => Promise<T>;
export interface GraphqlResolverConfig<T> {
  name: string;
  type: GraphqlResolverType;
  args?: GraphqlArg[];
  returnType: string;
  description?: string;
  includeErrorStack?: boolean;
  unionTypeResolver?(input: T): T & { __typename: string };
  resolver<K>(args: K): Promise<T>;
}
export interface GraphqlResolver<T> {
  name: string;
  type: GraphqlResolverType;
  root: {
    args?: GraphqlArg[];
    returnType: string;
  };
  description?: string;
  resolver<K>(args: K): Promise<GraphqlResponse<T>>;
}
