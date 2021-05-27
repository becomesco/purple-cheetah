import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { Logger } from '../util/logger';

export interface MiddlewareConfig {
  name: string;
  path?: string;
  after?: boolean;
  handler: (data: {
    name: string;
    path: string;
    after: boolean;
    logger: Logger;
  }) => RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
export interface Middleware {
  name: string;
  path: string;
  after: boolean;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}
