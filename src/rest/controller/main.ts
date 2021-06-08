import type {
  Controller,
  ControllerConfig,
  ControllerMethod,
  ControllerMethodConfig,
  Logger,
} from '../../types';
import { useLogger } from '../../util';
import { createHTTPError } from '../error';

/**
 * Function which creates a Controller method object. This function is mant to
 * be used in a Controller object.
 */
export function createControllerMethod<PreRequestHandlerReturnType, ReturnType>(
  config: ControllerMethodConfig<PreRequestHandlerReturnType, ReturnType>,
) {
  return config;
}

function wrapControllerMethod<SetupResult, PreRequestHandlerResult, ReturnType>(
  logger: Logger,
  setupResult: SetupResult,
  methodName: string,
  config: ControllerMethodConfig<PreRequestHandlerResult, ReturnType>,
): ControllerMethod {
  const name = methodName;
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
        let preRequestHandlerResult: PreRequestHandlerResult = {} as never;
        if (config.preRequestHandler) {
          preRequestHandlerResult = await config.preRequestHandler({
            logger,
            errorHandler,
            request,
            response,
            name,
          });
        }
        const handlerResult = await config.handler({
          logger,
          errorHandler,
          request,
          response,
          name,
          ...preRequestHandlerResult,
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

/**
 * Function which create a Controller object. Output of this function is used
 * in `controllers` property of the `createPurpleCheetah` function
 * configuration.
 */
export function createController<SetupResult>(
  config: ControllerConfig<SetupResult>,
): Controller {
  return () => {
    const logger = useLogger({
      name: config.name,
    });
    if (!config.path.startsWith('/')) {
      config.path = '/' + config.path;
    }
    const setupResult = config.setup
      ? config.setup({
          controllerName: config.name,
          controllerPath: config.path,
        })
      : ({} as never);

    function getMethods() {
      const configMethods = config.methods(setupResult);
      const methodNames = Object.keys(configMethods);
      const methods: ControllerMethod[] = [];
      for (let i = 0; i < methodNames.length; i++) {
        const method = configMethods[methodNames[i]];
        methods.push(
          wrapControllerMethod(logger, setupResult, methodNames[i], {
            type: method.type,
            path: method.path,
            preRequestHandler: method.preRequestHandler,
            handler: method.handler,
          }),
        );
      }
      return methods;
    }

    return {
      name: config.name,
      path: config.path,
      methods: getMethods,
      logger,
    };
  };
}
