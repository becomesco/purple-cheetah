import type { HTTPException, Middleware } from '../types';
import { createMiddleware } from './middleware';
import type { ErrorRequestHandler } from 'express';

export function createHTTPExceptionHandlerMiddleware(): Middleware {
  return createMiddleware({
    name: 'HTTP Exception Handler Middleware',
    after: true,
    handler(data) {
      const handler: ErrorRequestHandler = async (
        error,
        request,
        response,
        next,
      ) => {
        if (!error) {
          next();
        } else {
          const exception = error as HTTPException<unknown>;
          if (exception.status && exception.message) {
            data.logger.warn('', error);
            if (typeof error.message === 'object') {
              response.status(error.status).json(error.message);
            } else {
              response.status(error.status).json({ message: error.message });
            }
          } else {
            data.logger.error('', {
              method: request.method,
              path: request.url,
              error: {
                message: error.message,
                stack: error.stack.split('\n'),
              },
            });
            response.status(500).json({ message: 'Unknown exception' });
          }
        }
      };
      return handler;
    },
  });
}
