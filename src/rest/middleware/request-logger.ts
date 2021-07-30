import type { Middleware } from '../../types';
import { createMiddleware } from './main';
import type { RequestHandler } from 'express';

/**
 * Creates a request logger middleware. This middleware
 * will log each and every request with come essential information about
 * the request.
 */
export function createRequestLoggerMiddleware(): Middleware {
  return createMiddleware({
    name: 'Request Logger Middleware',
    after: false,
    handler(data) {
      const handler: RequestHandler = async (request, _res, next) => {
        data.logger.info(request.method, request.url);
        next();
      };
      return handler;
    },
  });
}
