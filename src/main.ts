import * as express from 'express';
import * as http from 'http';
import type {
  Controller,
  Middleware,
  PurpleCheetah,
  PurpleCheetahConfig,
} from './types';
import { createQueue, updateLogger, useLogger } from './util';

export function createPurpleCheetah(
  config: PurpleCheetahConfig,
): PurpleCheetah {
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
  const logger = useLogger({
    name: 'Purple Cheetah',
  });
  const app = express();
  const server = http.createServer(app);

  if (config.requestLoggerMiddleware) {
    config.requestLoggerMiddleware.after = false;
    config.middleware.push(config.requestLoggerMiddleware);
  }
  if (config.httpExceptionHandlerMiddleware) {
    config.httpExceptionHandlerMiddleware.after = true;
    config.middleware.push(config.httpExceptionHandlerMiddleware);
  } else {
    // TODO: Add default
  }
  if (config.notFoundMiddleware) {
    config.notFoundMiddleware.after = true;
    config.middleware.push(config.notFoundMiddleware);
  } else {
    // TODO: Add default
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
  function initialize(controllers: Controller[], middleware: Middleware[]) {
    if (config.staticContentDir) {
      app.use(express.static(config.staticContentDir));
    }
    if (config.start) {
      config.start();
    }
    initializeMiddleware(middleware, false);
    if (config.middle) {
      config.middle();
    }
    initializeControllers(controllers);
    initializeMiddleware(middleware, true);
    if (config.finalize) {
      config.finalize();
    }
  }

  const queue = createQueue();
  const popQueue = queue.push('Initialize');
  const popSub = queue.subscribe((type, name, hasQueueItems, queueItems) => {
    if (type === 'push') {
      logger.info('queue', `"${name}" has been registered.`);
    } else {
      logger.info('queue', `"${name}" has been unregistered.`);
      if (queueItems.length === 1 && queueItems[0] === 'Initialize') {
        initialize(
          config.controllers as Controller[],
          config.middleware as Middleware[],
        );
        popSub();
        popQueue();
      }
    }
  });
  if (config.modules) {
    // TODO: Initialize modules
  } else {
    popSub();
    popQueue();
    initialize(config.controllers, config.middleware);
  }

  return {
    app,
    server,
    isInitialized() {
      return initialized;
    },
    async listen() {},
  };
}
