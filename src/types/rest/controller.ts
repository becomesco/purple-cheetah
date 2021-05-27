import type { Logger } from '../util/logger';
import type { NextFunction, Request, Response, Router } from 'express';
import type { HTTPError } from './error';

export type ControllerMethodType = 'get' | 'post' | 'put' | 'delete';
export interface ControllerMethod {
  type: ControllerMethodType;
  path: string;
  handler: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
}
export interface ControllerMethodConfig<
  PreRequestHandlerReturnType,
  ReturnType,
> {
  name?: string;
  type: ControllerMethodType;
  path: string;
  preRequestHandler?(data: {
    request: Request;
    response: Response;
  }): Promise<PreRequestHandlerReturnType>;
  handler(data: {
    request: Request;
    response: Response;
    pre?: PreRequestHandlerReturnType;
    logger: Logger;
    errorHandler: HTTPError;
  }): Promise<ReturnType>;
}

export interface ControllerConfig {
  /**
   * Name of the controller. Used for generated logger
   * and to organize errors.
   */
  name: string;
  /**
   * Path of the controller name the same way as
   * Express route.
   *
   * For example: /my/controller
   * Or: /my/controller/:slug
   */
  path: string;
  methods: ControllerMethodConfig<unknown, unknown>[];
}
export interface Controller {
  /**
   * Name of the controller. Used for generated logger
   * and to organize errors.
   */
  name: string;
  /**
   * Path of the controller name the same way as
   * Express route.
   *
   * For example: /my/controller
   * Or: /my/controller/:slug
   */
  path: string;
  logger: Logger;
  router: Router;
  // initRouter: () => void;
  methods: ControllerMethod[];
}
