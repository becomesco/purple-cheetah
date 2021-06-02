import { v4 as uuidv4 } from 'uuid';
import type {
  Controller,
  ControllerConfig,
  ControllerMethod,
  ControllerMethodConfig,
  Logger,
} from '../../types';
import { useLogger } from '../../util';
import { createHTTPError } from '../error';

export function createControllerMethod<
  PreRequestHandlerReturnType,
  ReturnType,
  SetupResult,
>(
  config: ControllerMethodConfig<
    PreRequestHandlerReturnType,
    ReturnType,
    SetupResult
  >,
) {
  return config;
}
function wrapControllerMethod<
  PreRequestHandlerReturnType,
  ReturnType,
  SetupResult,
>(
  logger: Logger,
  setup: SetupResult,
  config: ControllerMethodConfig<
    PreRequestHandlerReturnType,
    ReturnType,
    SetupResult
  >,
): ControllerMethod {
  const name = config.name ? config.name : uuidv4();
  let path = config.path ? config.path : '';
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  const errorHandler = createHTTPError({
    place: name ? name : path,
    logger,
  });
  return {
    type: config.type,
    path,
    handler: async (request, response, next) => {
      try {
        let preRequestHandlerResult: PreRequestHandlerReturnType | undefined =
          undefined;
        if (config.preRequestHandler) {
          preRequestHandlerResult = await config.preRequestHandler({
            request,
            response,
            name,
            logger,
            errorHandler,
            ...setup,
          });
        }
        const handlerResult = await config.handler({
          logger,
          errorHandler,
          request,
          response,
          pre: preRequestHandlerResult as never,
          name,
          ...setup,
        });
        if (handlerResult instanceof Buffer) {
          response.send(handlerResult);
        } else if (typeof handlerResult === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
export function createController<SetupReturn>(
  config: ControllerConfig<SetupReturn>,
): Controller {
  const logger = useLogger({
    name: config.name,
  });
  if (!config.path.startsWith('/')) {
    config.path = '/' + config.path;
  }
  const setupResult = config.setup({ name: config.name, path: config.path });
  const methods: ControllerMethod[] = [];
  for (let i = 0; i < config.methods.length; i++) {
    const method = config.methods[i];
    methods.push(
      wrapControllerMethod(logger, setupResult, {
        name: method.name,
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
  };
}
