import * as express from 'express';
import * as http from 'http';
import type {
  Controller,
  Middleware,
  PurpleCheetah,
  PurpleCheetahConfig,
} from './types';
import {
  createHTTPExceptionHandlerMiddleware,
  createNotFoundMiddleware,
} from './rest';
import { ConsoleColors, Logger, createLogger } from './util';
import { createDocs, PurpleCheetahDocs } from './doc';

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
  if (!config.controllers) {
    config.controllers = [];
  }
  if (!config.middleware) {
    config.middleware = [];
  }
  let modules = config.modules ? config.modules : [];
  modules = [createLogger(config.logger), ...modules];
  const logger = new Logger('Purple cheetah');
  const app = express();
  const server = http.createServer(app);
  let ready = false;

  async function initializeControllers(
    controllers: Controller[],
  ): Promise<void> {
    for (let i = 0; i < controllers.length; i++) {
      const controller = controllers[i];
      if (controller) {
        const data = await controller({ expressApp: app });
        PurpleCheetahDocs[data.name] = {
          description: data.description || '',
          path: data.path,
          methods: {},
        };
        logger.info('controller', `${data.name}`);
        const methods = data.methods();
        methods.forEach((method) => {
          if (method.doc) {
            PurpleCheetahDocs[data.name].methods[method.path] = {
              ...method.doc,
              type: method.type,
            };
          } else {
            PurpleCheetahDocs[data.name].methods[method.path] = {
              description: '',
              type: method.type,
              response: {
                json: {
                  unknown: {
                    __type: 'string',
                    __required: false,
                  },
                },
              },
            };
          }
          const path = (data.path + method.path).replace(/\/\//g, '/');
          logger.info('controller', `    --> ${path}`);
          app[method.type](path, method.handler);
        });
      }
    }
  }
  async function initializeMiddleware(
    _middleware: Middleware[],
    after: boolean,
  ): Promise<void> {
    const middleware = _middleware.map((e) => e());
    for (let i = 0; i < middleware.length; i++) {
      const mv = middleware[i];
      if (mv.after === after) {
        logger.info('middleware', `${mv.name} --> ${mv.path}`);
        app.use(mv.path, await mv.handler());
      }
    }
    if (after) {
      const exceptionMin = config.httpExceptionHandlerMiddleware
        ? config.httpExceptionHandlerMiddleware()
        : createHTTPExceptionHandlerMiddleware()();
      exceptionMin.after = true;
      logger.info('middleware', `Exception handler --> /*`);
      app.use(await exceptionMin.handler());

      const notFoundMid = config.notFoundMiddleware
        ? config.notFoundMiddleware()
        : createNotFoundMiddleware()();
      notFoundMid.after = true;
      logger.info('middleware', `404 --> /*`);
      app.use(await notFoundMid.handler());
    }
  }
  function loadNextModule() {
    if (modules.length > 0) {
      const module = modules.splice(0, 1)[0];
      if (modules.length > 1 && module.name !== 'Logger') {
        logger.info('loadModule', module.name + ' ...');
      }
      const timeOffset = Date.now();
      try {
        let nextCalled = false;
        module.initialize({
          name: module.name,
          rootConfig: config,
          purpleCheetah: self,
          expressApp: app,
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
      } catch (error) {
        const e = error as Error;
        logger.error(`loadModule`, {
          name: module.name,
          error: ('' + e.stack).split('\n'),
        });
        process.exit(1);
      }
    }
  }
  async function init() {
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
    await initializeMiddleware(config.middleware, false);
    if (config.middle) {
      config.middle();
    }
    await initializeControllers(config.controllers);
    await initializeMiddleware(config.middleware, true);
    if (config.finalize) {
      config.finalize();
    }
  }

  modules.push(
    {
      name: 'Purple Cheetah Initialize',
      initialize({ next }) {
        init()
          .then(() => next())
          .catch((err) => next(err));
      },
    },
    createDocs(),
    {
      name: 'Start Server',
      initialize({ next, name }) {
        try {
          logger.info(name, 'working...');
          server.listen(config.port, () => {
            if (!config.silentLogs) {
              // eslint-disable-next-line no-console
              console.log(`
              ${ConsoleColors.FgMagenta}Purple Cheetah${
                ConsoleColors.Reset
              } - ${ConsoleColors.FgGreen}Started Successfully${
                ConsoleColors.Reset
              }
              -------------------------------------             
              PORT: ${config.port}
              PID: ${process.pid}
              TTS: ${(Date.now() - rootTimeOffset) / 1000}s
              \n`);
            }
            ready = true;
            if (config.onReady) {
              config.onReady(self);
            }
            next();
          });
        } catch (error) {
          next(error as Error);
        }
      },
    },
  );

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
