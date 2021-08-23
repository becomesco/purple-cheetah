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

/**
 * Will create a Purple Cheetah object. This includes mounting all module,
 * controller and middleware objects, creating Express application and
 * starting the HTTP server. It is important to know that this function
 * is asynchronous with `onReady` callback function. Mounding is
 * performed in specific order:
 *
 * - First step is mounting modules. They are mounded in FIFO order
 * and once 1 module is mounted, it will trigger a callback which will mount
 * the next module, and so on.
 * - With all modules mounted, if `start` function is present in the
 * configuration, it will be called.
 * - Next step is mounting middleware objects which have flag **after**
 * equal to *false*.
 * - After that, is `middle` function is present in the configuration, it will
 * be called.
 * - In next step, all [controller](#controller) objects will be mounted in
 * FIFO order.
 * - With all controllers mounted successfully, all middleware objects, with
 * flag **after** equal to *true*, will be mounted.
 * - If `finalize` function is present in the configuration, it will be called.
 * - With all above steps completed successfully, HTTP server will be started
 * and it will print like shown below:
 *
 * ```text
 * Purple Cheetah - Started Successfully
 * -------------------------------------
 * PORT: 1280
 * PID: 24720
 * TTS: 0.007s
 * ```
 */
export function createPurpleCheetah(
  config: PurpleCheetahConfig,
): PurpleCheetah {
  const rootTimeOffset = Date.now();
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

  function initializeControllers(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      if (controller) {
        const data = controller();
        logger.info('controller', `${data.name}`);
        const methods = data.methods();
        methods.forEach((method) => {
          const path = (data.path + method.path).replace(/\/\//g, '/');
          logger.info('controller', `    --> ${path}`);
          app[method.type](path, method.handler);
        });
      }
    });
  }
  function initializeMiddleware(
    _middleware: Middleware[],
    after: boolean,
  ): void {
    const middleware = _middleware.map((e) => e());
    middleware
      .filter((mv) => mv.after === after)
      .forEach((mv) => {
        logger.info('middleware', `${mv.name} --> ${mv.path}`);
        app.use(mv.path, mv.handler);
      });
    if (after) {
      const exceptionMin = config.httpExceptionHandlerMiddleware
        ? config.httpExceptionHandlerMiddleware()
        : createHTTPExceptionHandlerMiddleware()();
      exceptionMin.after = true;
      logger.info('middleware', `Exception handler --> /*`);
      app.use(exceptionMin.handler);

      const notFoundMid = config.notFoundMiddleware
        ? config.notFoundMiddleware()
        : createNotFoundMiddleware()();
      notFoundMid.after = true;
      logger.info('middleware', `404 --> /*`);
      app.use(notFoundMid.handler);
    }
  }
  function loadNextModule() {
    if (modules.length > 0) {
      const module = modules.splice(0, 1)[0];
      if (modules.length > 1) {
        logger.info('loadModule', module.name + ' ...');
      }
      const timeOffset = Date.now();
      try {
        let nextCalled = false;
        module.initialize({
          name: module.name,
          rootConfig: config,
          purpleCheetah: self,
          next(error, data) {
            if (nextCalled) {
              return;
            }
            nextCalled = true;
            if (error) {
              logger.error('loadModule', {
                name: module.name,
                error: ('' + error.stack).split('\n'),
              });
              process.exit(1);
            } else {
              if (data) {
                if (data.controllers) {
                  for (let i = 0; i < data.controllers.length; i++) {
                    (config.controllers as Controller[]).push(
                      data.controllers[i],
                    );
                  }
                }
                if (data.middleware) {
                  for (let i = 0; i < data.middleware.length; i++) {
                    (config.middleware as Middleware[]).push(
                      data.middleware[i],
                    );
                  }
                }
              }
              if (modules.length > 1) {
                logger.info(
                  'loadModule',
                  `    Done in: ${(Date.now() - timeOffset) / 1000}s`,
                );
              }
              loadNextModule();
            }
          },
        });
      } catch (e) {
        logger.error(`loadModule`, {
          name: module.name,
          error: ('' + e.stack).split('\n'),
        });
        process.exit(1);
      }
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
        server.listen(config.port, () => {
          console.log(`
            ${ConsoleColors.FgMagenta}Purple Cheetah${ConsoleColors.Reset} - ${
            ConsoleColors.FgGreen
          }Started Successfully${ConsoleColors.Reset}
            -------------------------------------             
            PORT: ${config.port}
            PID: ${process.pid}
            TTS: ${(Date.now() - rootTimeOffset) / 1000}s
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

  const self: PurpleCheetah = {
    getExpress() {
      return app;
    },
    getServer() {
      return server;
    },
    isReady() {
      return ready;
    },
  };
  loadNextModule();
  return self;
}
