import {
  GraphqlResolver,
  GraphqlResolverConfig,
  GraphqlResponse,
  HTTPException,
} from '../../types';
import { createGraphqlResponseObject } from './object';

export function createGraphqlResolver<T>(
  config: GraphqlResolverConfig<T>,
): GraphqlResolver<T> {
  return {
    name: config.name,
    type: config.type,
    description: config.description,
    root: {
      args: config.args ? config.args : [],
      returnType: createGraphqlResponseObject({ name: config.returnType }).name,
    },
    async resolver<K>(args: K): Promise<GraphqlResponse<T>> {
      try {
        const result = await config.resolver(args);
        if (result instanceof Array) {
          if (typeof config.unionTypeResolver === 'function') {
            return {
              result: config.unionTypeResolver(result),
            };
          }
          return {
            result: result,
          };
        }
        if (typeof config.unionTypeResolver === 'function') {
          return {
            result: config.unionTypeResolver(result),
          };
        } else {
          return { result };
        }
      } catch (error) {
        if (error instanceof HTTPException) {
          const err = error as HTTPException<never>;
          return {
            error: {
              status: err.status,
              message:
                err.message && err.message.message ? error.message.message : '',
              stack: config.includeErrorStack ? error.stack : undefined,
            },
          };
        }
        return {
          error: {
            status: 500,
            message: error.message,
            stack:
              error.stack && config.includeErrorStack
                ? error.stack.split('\n')
                : undefined,
          },
        };
      }
    },
  };
}
