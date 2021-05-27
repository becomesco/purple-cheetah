import type {
  Controller,
  ControllerConfig,
  ControllerMethod,
  ControllerMethodConfig,
  Logger,
} from '../types';
import { useLogger } from '../util';
import { Router } from 'express';
import { createHTTPError } from './error';

export function createControllerMethod<PreRequestHandlerReturnType, ReturnType>(
  config: ControllerMethodConfig<PreRequestHandlerReturnType, ReturnType>,
) {
  return config;
}
function wrapControllerMethod<PreRequestHandlerReturnType, ReturnType>(
  logger: Logger,
  {
    name,
    type,
    path,
    handler,
    preRequestHandler,
  }: ControllerMethodConfig<PreRequestHandlerReturnType, ReturnType>,
): ControllerMethod {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const errorHandler = createHTTPError({
    place: name ? name : path,
    logger,
  });
  return {
    type,
    path,
    handler: async (request, response, next) => {
      try {
        let preRequestHandlerResult: PreRequestHandlerReturnType | undefined =
          undefined;
        if (preRequestHandler) {
          preRequestHandlerResult = await preRequestHandler({
            request,
            response,
          });
        }
        const handlerResult = await handler({
          logger,
          errorHandler,
          request,
          response,
          pre: preRequestHandlerResult,
        });
        if (handlerResult instanceof Buffer) {
          response.send(handlerResult);
        } else if (typeof handlerResult === 'object') {
          const obj = handlerResult as any;
          if (typeof obj.__file !== 'undefined') {
            response.sendFile(obj.__file);
          } else {
            response.json(obj);
          }
        } else {
          response.status(200);
          response.send(handlerResult);
        }
        response.end();
      } catch (e) {
        next(e);
      }
    },
  };
}
export function createController(config: ControllerConfig): Controller {
  const logger = useLogger({
    name: config.name,
  });
  if (!config.path.startsWith('/')) {
    config.path = '/' + config.path;
  }
  const router = Router();
  const methods: ControllerMethod[] = [];
  for (let i = 0; i < config.methods.length; i++) {
    const method = config.methods[i];
    methods.push(
      wrapControllerMethod(logger, {
        type: method.type,
        path: method.path,
        preRequestHandler: method.preRequestHandler,
        handler: method.handler,
      }),
    );
  }

  return {
    name: config.name,
    path: config.path,
    methods,
    logger,
    router,
  };
}
