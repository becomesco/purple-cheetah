import type { Logger } from '../logger';
import type { NextFunction, Request, Response, Router } from 'express';

export type ControllerMethodType = 'get' | 'post' | 'put' | 'delete';
export type ControllerMethodPreRequestHandler<T> = (data: {
  request: Request;
  response: Response;
}) => Promise<T>;
export type ControllerMethodHandler<PreRequestHandlerReturnType, ReturnType> =
  (data: {
    request: Request;
    response: Response;
    next: NextFunction;
    pre: PreRequestHandlerReturnType;
    logger: Logger;
  }) => Promise<ReturnType>;
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
  type: ControllerMethodType;
  path: string;
  preRequestHandler?: ControllerMethodPreRequestHandler<PreRequestHandlerReturnType>;
  handler: ControllerMethodHandler<PreRequestHandlerReturnType, ReturnType>;
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
  initRouter: () => void;
  methods: ControllerMethod[];
}
