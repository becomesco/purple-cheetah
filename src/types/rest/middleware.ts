import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { Logger } from '../util';
import type { NextHandleFunction } from 'connect';

export interface MiddlewareConfig {
  name: string;
  path?: string;
  after?: boolean;
  handler: (data: {
    name: string;
    path: string;
    after: boolean;
    logger: Logger;
  }) =>
    | RequestHandler
    | RequestHandler[]
    | ErrorRequestHandler
    | NextHandleFunction;
}
export type Middleware = () => MiddlewareData;
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
