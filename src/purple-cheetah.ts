import * as express from 'express';
import * as path from 'path';

import { Logger } from './logging';
import { MiddlewarePrototype } from './interfaces';
import { ControllerPrototype } from './interfaces';

export abstract class PurpleCheetah {
  private staticContentDir?: string;

  protected app: express.Application;
  protected logger: Logger;
  protected controllers: ControllerPrototype[];
  protected middleware: MiddlewarePrototype[];
  protected queue: Array<{
    id: string;
    state: boolean;
  }> = [];
  // tslint:disable-next-line:no-empty
  protected start(): void {}
  // tslint:disable-next-line:no-empty
  protected middle(): void {}
  // tslint:disable-next-line:no-empty
  protected finalize(): void {}

  constructor(config?: {
    logFileLocation?: string;
    staticContentDirectory?: string;
  }) {
    if (config && config.logFileLocation) {
      Logger.setLogPath(config.logFileLocation);
    } else {
      Logger.setLogPath(path.join(process.cwd(), 'logs'));
    }
    if (config && config.staticContentDirectory) {
      this.staticContentDir = config.staticContentDirectory;
    }

    const waitForQueue = setInterval(() => {
      if (!this.queue.find((e) => e.state === false)) {
        this.logger.info('', 'Queue empty, continue with mounting.');
        this.controllers.forEach((controller) => {
          if (controller) {
            controller.initRouter();
          }
        });
        this.start();
        this.initializeMiddleware(this.middleware, false);
        this.middle();
        this.initializeControllers(this.controllers);
        this.finalize();
        this.initializeMiddleware(this.middleware, true);
        // this.app.use('', (request: express.Request, response: express.Response) => {
        //   this.logger.warn('.404', {
        //     path: `${request.method}: ${request.originalUrl}`,
        //     message: 'Endpoint does not exist.',
        //   });
        //   response.status(404).json({
        //     path: `${request.method}: ${request.originalUrl}`,
        //     message: 'Endpoint does not exist.',
        //   });
        // });
        clearInterval(waitForQueue);
      }
    }, 50);
  }

  private initializeMiddleware(
    middleware: MiddlewarePrototype[],
    after: boolean,
  ) {
    middleware.forEach((e) => {
      if (e) {
        if (e.after === after) {
          if (e.uri) {
            if (e.handler instanceof Array) {
              e.handler.forEach((h) => {
                this.app.use(e.uri, h);
              });
            } else {
              this.app.use(e.uri, e.handler);
            }
          } else {
            this.app.use(e.handler);
          }
        }
      }
    });
  }

  private initializeControllers(controllers: ControllerPrototype[]) {
    if (this.staticContentDir) {
      this.app.use(express.static(this.staticContentDir));
    }
    controllers.forEach((controller) => {
      if (controller) {
        this.app.use(controller.baseUri, controller.router);
        this.logger.info('.controller', `[${controller.name}] mapping done.`);
      }
    });
  }

  public listen: () => void;
}
