import type { Logger } from '../util';
import type { NextFunction, Request, Response } from 'express';
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

export type ControllerPreRequestHandler<PreRequestHandlerReturnType> = (data: {
  name: string;
  logger: Logger;
  errorHandler: HTTPError;
  request: Request;
  response: Response;
}) => Promise<PreRequestHandlerReturnType>;

export type ControllerRequestHandler<PreRequestHandlerReturnType, ReturnType> =
  (data: {
    name: string;
    request: Request;
    response: Response;
    pre: PreRequestHandlerReturnType;
    logger: Logger;
    errorHandler: HTTPError;
  }) => Promise<ReturnType>;

export interface ControllerMethodConfig<
  PreRequestHandlerReturnType,
  ReturnType,
> {
  name?: string;
  type: ControllerMethodType;
  path?: string;
  preRequestHandler?: ControllerPreRequestHandler<PreRequestHandlerReturnType>;
  handler: ControllerRequestHandler<PreRequestHandlerReturnType, ReturnType>;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  methods: ControllerMethodConfig<any, any>[];
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
  methods: ControllerMethod[];
}
