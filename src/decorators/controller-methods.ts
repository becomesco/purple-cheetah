/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { NextFunction, Request, Response } from 'express';

export type ControllerMethodPreRequestHandler<T> = (
  request: Request,
  response: Response,
) => Promise<T>;

export type ControllerMethodData<T> = [Request, Response, NextFunction, T?];

/**
 * Decorator that will annotate a function as a GET method for
 * a [Controller](/globals.html#controller).
 */
export function Get<T>(
  uri?: string,
  preRequestHandler?: ControllerMethodPreRequestHandler<T>,
) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    return build('get', target, key, descriptor, uri, preRequestHandler);
  };
}

/**
 * Decorator that will annotate a function as a POST method for
 * a [Controller](/globals.html#controller).
 */
export function Post<T>(
  uri?: string,
  preRequestHandler?: ControllerMethodPreRequestHandler<T>,
) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    return build('post', target, key, descriptor, uri, preRequestHandler);
  };
}

/**
 * Decorator that will annotate a function as a PUT method for
 * a [Controller](/globals.html#controller).
 */
export function Put<T>(
  uri?: string,
  preRequestHandler?: ControllerMethodPreRequestHandler<T>,
) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    return build('put', target, key, descriptor, uri, preRequestHandler);
  };
}

/**
 * Decorator that will annotate a function as a DELETE method for
 * a [Controller](/globals.html#controller).
 */
export function Delete<T>(
  uri?: string,
  preRequestHandler?: ControllerMethodPreRequestHandler<T>,
) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    return build('delete', target, key, descriptor, uri, preRequestHandler);
  };
}

/**
 * Function that will inject method information into
 * a [Controller](/globals.html#controller).
 */
function build<T>(
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any,
  key: string | symbol,
  descriptor: PropertyDescriptor,
  uri?: string,
  preRequestHandler?: ControllerMethodPreRequestHandler<T>,
): PropertyDescriptor {
  let baseUri = '';
  if (uri) {
    baseUri = uri;
  }
  if (!target.endpoints) {
    target.endpoints = [];
  }
  const original = descriptor.value;
  descriptor.value = async (...args: [Request, Response, NextFunction, T]) => {
    try {
      // if (options && options.security) {
      //   if (options.security.throwableFunctions) {
      //     for (const i in options.security.throwableFunctions) {
      //       if (options.security.throwableFunctions[i]) {
      //         await options.security.throwableFunctions[i](args[0]);
      //       }
      //     }
      //   }
      // }
      if (preRequestHandler) {
        args[3] = await preRequestHandler(args[0], args[1]);
      }
      const result = await original.apply(target, args);
      if (result instanceof Buffer) {
        args[0].res.send(result);
      } else if (typeof result === 'object') {
        if (result.__file) {
          args[1].status(200);
          args[1].sendFile(result.__file);
          // args[0].res.end();
        } else {
          args[1].json(result);
        }
      } else {
        if (result) {
          args[1].status(200);
          args[1].send(result);
          args[1].end();
        }
      }
    } catch (e) {
      args[2](e);
    }
  };
  target.endpoints = [
    ...target.endpoints,
    {
      uri: baseUri,
      method,
      handler: descriptor.value,
    },
  ];
  return descriptor;
}
