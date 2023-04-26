import { ConsoleColors } from '../../util';
import type { Middleware } from '../../types';
import { createMiddleware } from './main';
import type { RequestHandler } from 'express';

/**
 * Creates a request logger middleware. This middleware
 * will log each and every request with come essential information about
 * the request.
 */
export function createRequestLoggerMiddleware(config?: {
  includeIp?: boolean;
  ipInHeader?: string;
}): Middleware {
  return createMiddleware({
    name: 'Request Logger Middleware',
    after: false,
    handler(data) {
      const handler: RequestHandler = async (request, _res, next) => {
        data.logger.info(
          request.method,
          `${
            config && config.includeIp
              ? config.ipInHeader
                ? `${ConsoleColors.Blink}(${
                    request.headers[config.ipInHeader]
                  })${ConsoleColors.Reset} `
                : `${ConsoleColors.Underscore}(${request.ip})${ConsoleColors.Reset} `
              : ''
          }${request.url}`,
        );
        next();
      };
      return handler;
    },
  });
}
