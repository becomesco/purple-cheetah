import type { Middleware, MiddlewareConfig } from '../types';

export function createMiddleware(config: MiddlewareConfig): Middleware {
  const after = !!config.after;
  let path = '/';
  if (config.path) {
    path = config.path.startsWith('/') ? config.path : '/' + config.path;
  }
  return {
    path,
    after,
    name: config.name,
    handler: config.handler,
  };
}
