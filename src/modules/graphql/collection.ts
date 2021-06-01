import type { GraphqlCollection, GraphqlCollectionConfig } from '../../types';

export function createGraphqlCollection(
  config: GraphqlCollectionConfig,
): GraphqlCollection {
  return {
    name: config.name,
    enums: config.enums ? config.enums : [],
    inputs: config.inputs ? config.inputs : [],
    objects: config.objects ? config.objects : [],
    resolvers: config.resolvers ? config.resolvers : [],
    unions: config.unions ? config.unions : [],
  };
}
