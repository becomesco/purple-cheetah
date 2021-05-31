import * as express from 'express';
import * as http from 'http';
import type {
  Controller,
  Middleware,
  PurpleCheetah,
  PurpleCheetahConfig,
} from './types';
import {
  ConsoleColors,
  initializeFS,
  initializeLogger,
  updateLogger,
  useLogger,
} from './util';
import {
  createHTTPExceptionHandlerMiddleware,
  createNotFoundMiddleware,
} from './rest';

export function createPurpleCheetah(
  config: PurpleCheetahConfig,
): PurpleCheetah {
  initializeFS();
  initializeLogger();

  if (!config.controllers) {
    config.controllers = [];
  }
  if (!config.middleware) {
    config.middleware = [];
  }
  if (config.logPath) {
    updateLogger({
      output: config.logPath,
    });
  }
  const modules = config.modules ? config.modules : [];
  const logger = useLogger({
    name: 'Purple Cheetah',
  });
  const app = express();
  const server = http.createServer(app);
  let ready = false;

  if (config.requestLoggerMiddleware) {
    config.requestLoggerMiddleware.after = false;
    config.middleware.push(config.requestLoggerMiddleware);
  }
  if (config.httpExceptionHandlerMiddleware) {
    config.httpExceptionHandlerMiddleware.after = true;
    config.middleware.push(config.httpExceptionHandlerMiddleware);
  } else {
    config.middleware.push(createHTTPExceptionHandlerMiddleware());
  }
  if (config.notFoundMiddleware) {
    config.notFoundMiddleware.after = true;
    config.middleware.push(config.notFoundMiddleware);
  } else {
    config.middleware.push(createNotFoundMiddleware());
  }

  function initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      if (controller) {
        logger.info('controller', `Mapping [${controller.name}]`);
        controller.methods.forEach((method) => {
          const path = (controller.path + method.path).replace(/\/\//g, '/');
          logger.info('controller', ` ---> ${path}`);
          app[method.type](path, method.handler);
        });
      }
    });
  }
  function initializeMiddleware(
    middleware: Middleware[],
    after: boolean,
  ): void {
    middleware
      .filter((mv) => mv.after === after)
      .forEach((mv) => {
        logger.info('middleware', `Mapping [${mv.name}] --> ${mv.path}`);
        app.use(mv.path, mv.handler);
      });
  }
  function loadNextModule() {
    if (modules.length > 0) {
      const module = modules.splice(0, 1)[0];
      module.initialize({
        name: module.name,
        next(error?: Error) {
          if (error) {
            logger.error('loadModule', {
              name: module.name,
              error,
            });
            process.exit(1);
          } else {
            loadNextModule();
          }
        },
      });
    }
  }
  modules.push({
    name: 'Purple Cheetah Initialize',
    initialize(moduleConfig) {
      if (!config.middleware) {
        config.middleware = [];
      }
      if (!config.controllers) {
        config.controllers = [];
      }
      if (config.staticContentDir) {
        app.use(express.static(config.staticContentDir));
      }
      if (config.start) {
        config.start();
      }
      initializeMiddleware(config.middleware, false);
      if (config.middle) {
        config.middle();
      }
      initializeControllers(config.controllers);
      initializeMiddleware(config.middleware, true);
      if (config.finalize) {
        config.finalize();
      }
      moduleConfig.next();
    },
  });
  modules.push({
    name: 'Start Server',
    initialize(moduleConfig) {
      try {
        logger.info(moduleConfig.name, 'working...');
        app.listen(config.port, () => {
          console.log(`
            ${ConsoleColors.FgMagenta}Purple Cheetah${ConsoleColors.Reset} - ${ConsoleColors.FgGreen}Started Successfully${ConsoleColors.Reset}
            -------------------------------------             
            PORT: ${config.port}
            PID: ${process.pid}
            \n`);
          ready = true;
          if (config.onReady) {
            config.onReady(self);
          }
          moduleConfig.next();
        });
      } catch (error) {
        moduleConfig.next(error);
      }
    },
  });

  loadNextModule();

  const self: PurpleCheetah = {
    app,
    server,
    isReady() {
      return ready;
    },
  };
  return self;
}
