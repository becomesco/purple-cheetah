import type { Middleware } from '../types';
import { createMiddleware } from './middleware';
import type { RequestHandler } from 'express';

export function createNotFoundMiddleware(): Middleware {
  return createMiddleware({
    name: 'Not Found Middleware',
    after: true,
    handler(data) {
      const handler: RequestHandler = async (request, response) => {
        const output = {
          path: `${request.method}: ${request.originalUrl}`,
          message: 'Endpoint does not exist.',
        };
        data.logger.warn('', output);
        response.status(404).json(output);
      };
      return handler;
    },
  });
}
