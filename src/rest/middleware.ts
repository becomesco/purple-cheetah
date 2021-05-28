import type { Middleware, MiddlewareConfig } from '../types';
import { useLogger } from '../util';

export function createMiddleware(config: MiddlewareConfig): Middleware {
  const after = !!config.after;
  let path = '/';
  if (config.path) {
    path = config.path.startsWith('/') ? config.path : '/' + config.path;
  }
  const logger = useLogger({ name: config.name });
  return {
    path,
    after,
    name: config.name,
    handler: config.handler({
      name: config.name,
      after,
      path,
      logger,
    }),
  };
}
