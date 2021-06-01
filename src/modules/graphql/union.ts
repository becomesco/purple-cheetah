import type { GraphqlUnion, GraphqlUnionConfig } from '../../types';
import { createGraphqlResponseObject } from './object';

export function createGraphqlUnion(config: GraphqlUnionConfig): GraphqlUnion {
  const wrapperObject = createGraphqlResponseObject({
    name: config.name,
  }).object;
  return {
    name: config.name,
    types: config.types,
    wrapperObject,
  };
}
