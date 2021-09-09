import type { Middleware, MiddlewareConfig } from '../../types';
import { useLogger } from '../../util';

/**
 * Will create a middleware object using specified configuration.
 */
export function createMiddleware(config: MiddlewareConfig): Middleware {
  const after = !!config.after;
  let path = '/';
  if (config.path) {
    path = config.path.startsWith('/') ? config.path : '/' + config.path;
  }
  const logger = useLogger({ name: config.name });
  return () => {
    return {
      path,
      after,
      name: config.name,
      handler: async () => {
        return await config.handler({
          name: config.name,
          after,
          path,
          logger,
        });
      },
    };
  };
}
