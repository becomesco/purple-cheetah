import type {
  GraphqlResolver,
  GraphqlResolverConfig,
  GraphqlResponse,
} from '../../types';
import { HTTPException } from '../../types';

export function createGraphqlResolver<T>(
  config: GraphqlResolverConfig<T>,
): GraphqlResolver<T> {
  return {
    name: config.name,
    type: config.type,
    description: config.description,
    root: {
      args: config.args ? config.args : [],
      returnType: config.returnType,
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
          return { result: result };
        }
      } catch (error) {
        if (error instanceof HTTPException) {
          return {
            error: {
              status: error.status,
              message: error.message.message,
              stack: config.includeErrorStack ? error.stack : undefined,
            },
          };
        }
        throw error;
      }
    },
  };
}
