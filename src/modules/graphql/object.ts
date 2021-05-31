import type { GraphqlObject, GraphqlObjectConfig } from '../../types';

export function createGraphqlResponseObject(config: {
  name: string;
  type?: string;
}): { name: string; object: GraphqlObject } {
  const name = `${config.name.replace(/\[/g, '').replace(/\]/g, '')}Response`;
  const type = typeof config.type !== 'string' ? config.name : config.type;

  return {
    name,
    object: {
      name,
      fields: [
        {
          name: 'error',
          type: 'GraphqlError',
        },
        {
          name: 'result',
          type: type,
        },
      ],
    },
  };
}
export function createGraphqlObject(
  config: GraphqlObjectConfig,
): GraphqlObject {
  return {
    name: config.name,
    type: config.type,
    description: config.description,
    fields: config.fields,
    wrapperObject: createGraphqlResponseObject({
      name: config.name,
      type: config.type,
    }).object,
  };
}
