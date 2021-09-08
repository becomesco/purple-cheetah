import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { Logger } from '../util';
import type { NextHandleFunction } from 'connect';

export interface MiddlewareConfig {
  /**
   * Name of the middleware. Used for organizing logs and errors.
   */
  name: string;
  /**
   * All request path which are starting with specified
   * path will be caught by the middleware.
   */
  path?: string;
  /**
   * Should middleware be mounted before mounting controllers or after.
   */
  after?: boolean;
  /**
   * Business logic implementation.
   */
  handler: (data: {
    /**
     * Middleware name.
     */
    name: string;
    /**
     * Path of the middleware.
     */
    path: string;
    /**
     * Is middleware mounting before or after mounting the controllers.
     */
    after: boolean;
    /**
     * Generated middleware logger.
     */
    logger: Logger;
  }) =>
    | RequestHandler
    | RequestHandler[]
    | ErrorRequestHandler
    | NextHandleFunction
    | Promise<
        | RequestHandler
        | RequestHandler[]
        | ErrorRequestHandler
        | NextHandleFunction
      >;
}

export type Middleware = () => Promise<MiddlewareData>;

export interface MiddlewareData {
  name: string;
  path: string;
  after: boolean;
  handler:
    | RequestHandler
    | RequestHandler[]
    | ErrorRequestHandler
    | NextHandleFunction;
}
