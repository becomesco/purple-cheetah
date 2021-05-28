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
          console.log(exception);
          if (exception.status && exception.message) {
            if (typeof exception.message === 'object') {
              response.status(exception.status).json(exception.message);
            } else {
              response
                .status(exception.status)
                .json({ message: exception.message });
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
