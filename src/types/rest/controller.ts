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

export type ControllerPreRequestHandler<
  PreRequestHandlerReturnType,
  SetupResult,
> = (
  data: {
    name: string;
    logger: Logger;
    errorHandler: HTTPError;
    request: Request;
    response: Response;
  } & SetupResult,
) => Promise<PreRequestHandlerReturnType>;

export type ControllerRequestHandler<
  PreRequestHandlerReturnType,
  ReturnType,
  SetupResult,
> = (
  data: {
    name: string;
    request: Request;
    response: Response;
    pre: PreRequestHandlerReturnType;
    logger: Logger;
    errorHandler: HTTPError;
  } & SetupResult,
) => Promise<ReturnType>;

export interface ControllerMethodConfig<
  PreRequestHandlerReturnType,
  ReturnType,
  SetupResult,
> {
  name?: string;
  type: ControllerMethodType;
  path?: string;
  preRequestHandler?: ControllerPreRequestHandler<
    PreRequestHandlerReturnType,
    SetupResult
  >;
  handler: ControllerRequestHandler<
    PreRequestHandlerReturnType,
    ReturnType,
    SetupResult
  >;
}

export interface ControllerConfig<SetupResult> {
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
  setup(config: { name: string; path: string }): SetupResult;
  methods: ControllerMethodConfig<unknown, unknown, SetupResult>[];
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
