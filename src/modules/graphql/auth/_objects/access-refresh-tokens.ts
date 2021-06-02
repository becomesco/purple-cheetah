import type { GraphqlObject } from '../../../../types';
import { createGraphqlObject } from '../../object';

export function createGraphqlAuthAccessRefreshTokensObject(): GraphqlObject {
  return createGraphqlObject({
    name: 'AuthAccessRefreshTokens',
    fields: {
      accessToken: 'String!',
      refreshToken: 'String!',
    },
  });
}
