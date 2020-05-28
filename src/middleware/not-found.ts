import { MiddlewarePrototype } from '../interfaces';
import { Middleware } from '../decorators';
import {
  RequestHandler,
  ErrorRequestHandler,
  Request,
  Response,
} from 'express';
import { Logger } from 'src/logging';

@Middleware({
  after: true,
})
export class NotFoundMiddleware implements MiddlewarePrototype {
  uri?: string;
  after: boolean;
  logger: Logger;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler = (
    request: Request,
    response: Response,
  ) => {
    this.logger.warn('.404', {
      path: `${request.method}: ${request.originalUrl}`,
      message: 'Endpoint does not exist.',
    });
    response.status(404).json({
      path: `${request.method}: ${request.originalUrl}`,
      message: 'Endpoint does not exist.',
    });
  }
}
