import type { NextFunction, Request, Response } from 'express';
import type { Logger } from '../../util';
import type { HTTPError } from '../error';

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

export interface ControllerMethodConfig<PreRequestHandlerResult, ReturnType> {
  type: ControllerMethodType;
  path?: string;
  preRequestHandler?: ControllerMethodPreRequestHandler<PreRequestHandlerResult>;
  handler: ControllerMethodRequestHandler<PreRequestHandlerResult, ReturnType>;
}

export type ControllerMethodPreRequestHandlerData = {
  name: string;
  logger: Logger;
  errorHandler: HTTPError;
  request: Request;
  response: Response;
};

export type ControllerMethodPreRequestHandler<PreRequestHandlerResult> = (
  data: ControllerMethodPreRequestHandlerData,
) => Promise<PreRequestHandlerResult>;

export type ControllerMethodRequestHandlerData = {
  name: string;
  request: Request;
  response: Response;
  logger: Logger;
  errorHandler: HTTPError;
};

export type ControllerMethodRequestHandler<
  PreRequestHandlerResult,
  ReturnType,
> = (
  data: ControllerMethodRequestHandlerData & PreRequestHandlerResult,
) => Promise<ReturnType>;
