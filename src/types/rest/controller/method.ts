import type { NextFunction, Request, Response } from 'express';
import type { Logger } from '../../util';
import type { HTTPError } from '../error';

/**
 * HTTP method type.
 */
export type ControllerMethodType = 'get' | 'post' | 'put' | 'delete';

/**
 * Object returned from the `createControllerMethod` function.
 */
export interface ControllerMethod {
  type: ControllerMethodType;
  path: string;
  handler: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>;
}

/**
 * Configuration object for creating a controller method.
 */
export interface ControllerMethodConfig<
  PreRequestHandlerResult = unknown,
  ReturnType = unknown,
> {
  /**
   * Type of the HTTP request which will be handled by this controller method.
   */
  type: ControllerMethodType;
  /**
   * Path on which controller method will be available.
   */
  path?: string;
  /**
   * Method which will be called before `handler` method on each request.
   * Output from `preRequestHandler` method is available in `handler` method.
   */
  preRequestHandler?: ControllerMethodPreRequestHandler<PreRequestHandlerResult>;
  /**
   * Method which holds a business logic for specified REST endpoint. It is
   * recommended not to use Express Response object (which is available as
   * a parameter) directly but to return an object which will be converted
   * into JSON response.
   *
   * If there is a need to return a file from the `handler`, there are 2
   * options:
   *
   * - File can be sent in a response by return a Buffer from the `handler`
   * method.
   * - Returning an object with `__file` property of type string which
   * holds the absolute path to the file. This option is more efficient
   * then returning a Buffer because it uses response stream.
   */
  handler: ControllerMethodRequestHandler<PreRequestHandlerResult, ReturnType>;
}

export type ControllerMethodPreRequestHandlerData = {
  /**
   * Name of the method
   */
  name: string;
  /**
   * Controller logger
   */
  logger: Logger;
  /**
   * HTTP error handler. You can use it to throw controlled
   * exceptions.
   */
  errorHandler: HTTPError;
  /**
   * Express request
   */
  request: Request;
  /**
   * Express response. It is recommended not to use this object
   * directly.
   */
  response: Response;
};

export type ControllerMethodPreRequestHandler<
  PreRequestHandlerResult = unknown,
> = (
  data: ControllerMethodPreRequestHandlerData,
) => Promise<PreRequestHandlerResult>;

export type ControllerMethodRequestHandlerData = {
  /**
   * Name of the method
   */
  name: string;
  /**
   * Express request
   */
  request: Request;
  /**
   * Express response. It is recommended not to use this object
   * directly.
   */
  response: Response;
  /**
   * Controller logger
   */
  logger: Logger;
  /**
   * HTTP error handler. You can use it to throw controlled
   * exceptions.
   */
  errorHandler: HTTPError;
};

export type ControllerMethodRequestHandler<
  PreRequestHandlerResult = unknown,
  ReturnType = unknown,
> = (
  data: ControllerMethodRequestHandlerData & PreRequestHandlerResult,
) => Promise<ReturnType>;
