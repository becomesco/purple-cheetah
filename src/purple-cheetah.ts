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
  public static queue: Array<{
    id: string;
    state: boolean;
  }> = [];
  public static pushToQueue(id: string) {
    const q = this.queue.find((e) => e.id === id);
    if (!q) {
      this.queue.push({
        id,
        state: false,
      });
    }
  }
  public static isQueueFree() {
    return this.queue.find((e) => e.state === false) ? false : true;
  }
  public static freeQueue(id: string) {
    this.queue.forEach((e) => {
      if (e.id === id) {
        e.state = true;
      }
    });
  }
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
    new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 50);
    }).then(() => {
      if (config && config.logFileLocation) {
        Logger.setLogPath(config.logFileLocation);
      } else {
        Logger.setLogPath(path.join(process.cwd(), 'logs'));
      }
      if (config && config.staticContentDirectory) {
        this.staticContentDir = config.staticContentDirectory;
      }
      new Promise((resolve, reject) => {
        const waitForQueue = setInterval(() => {
          if (PurpleCheetah.isQueueFree() === true) {
            clearInterval(waitForQueue);
            resolve();
          }
        }, 20);
      }).then(() => {
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
        this.logger.info('', 'Initialized.');
      });
    });
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
        this.logger.info('controller', `[${controller.name}] mapping done.`);
      }
    });
  }

  public listen: () => void;
}
