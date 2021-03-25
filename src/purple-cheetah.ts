import * as express from 'express';
import * as path from 'path';
import {Server} from 'http';

import { Logger } from './logging';
import { MiddlewarePrototype } from './interfaces';
import { ControllerPrototype } from './interfaces';
import { Queue } from './util';

export abstract class PurpleCheetah {
  private staticContentDir?: string;

  protected app: express.Application;
  protected logger: Logger;
  protected controllers: ControllerPrototype[];
  protected middleware: MiddlewarePrototype[];

  public static readonly Queue = new Queue();
  public static initialized = false;

  protected start(): void {
    // User implementation
  }
  protected middle(): void {
    // User implementation
  }
  protected finalize(): void {
    // User implementation
  }

  constructor(config?: {
    logFileLocation?: string;
    staticContentDirectory?: string;
  }) {
    const init = () => {
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
    };
    if (!PurpleCheetah.Queue.hasItems()) {
      init();
    } else {
      const popQueue = PurpleCheetah.Queue.push('Initialize');
      const popSub = PurpleCheetah.Queue.subscribe(
        (type, name, hasQueueItems, queueItems) => {
          if (type === 'push') {
            this.logger.info('queue', `"${name}" has been registered.`);
          } else {
            this.logger.info('queue', `"${name}" has been unregistered.`);
            if (queueItems.length === 1 && queueItems[0] === 'Initialize') {
              init();
              popSub();
              popQueue();
            }
          }
        },
      );
    }
    if (config && config.logFileLocation) {
      Logger.setLogPath(config.logFileLocation).catch((error) => {
        console.error(error);
        process.exit(1);
      });
    } else {
      Logger.setLogPath(path.join(process.cwd(), 'logs')).catch((error) => {
        console.error(error);
        process.exit(1);
      });
    }
    if (config && config.staticContentDirectory) {
      this.staticContentDir = config.staticContentDirectory;
    }
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

  public listen: () => Promise<Server>;
}
