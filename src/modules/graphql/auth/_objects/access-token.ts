import type { GraphqlObject } from '../../../../types';
import { createGraphqlObject } from '../../object';

export function createGraphqlAuthAccessTokenObject(): GraphqlObject {
  return createGraphqlObject({
    name: 'AuthAccessToken',
    fields: {
      accessToken: 'String!',
    },
  });
}
