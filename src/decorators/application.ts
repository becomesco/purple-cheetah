import * as express from 'express';
import * as http from 'http';
import { Logger } from '../logging';
import { MiddlewarePrototype, ControllerPrototype } from '../interfaces';
import {
  NotFoundMiddleware,
  HttpExceptionHandlerMiddleware,
} from '../middleware';
import { PurpleCheetah } from '../purple-cheetah';
import { MiracleGatewayConfig, MiracleGatewayMiddleware } from '../miracle';

export interface ApplicationConfig {
  port: number;
  controllers: ControllerPrototype[];
  middleware: MiddlewarePrototype[];
  requestLoggerMiddleware?: MiddlewarePrototype;
  notFoundMiddleware?: MiddlewarePrototype;
  httpExceptionHandlerMiddleware?: MiddlewarePrototype;
  /**
   * Method for initializing Miracle Gateway.
   *
   * @deprecated since version 2.0.21.
   */
  gateway?: MiracleGatewayConfig;
}

export function Application(config: ApplicationConfig) {
  return (target: any) => {
    target.prototype.logger = new Logger('PurpleCheetah');
    target.prototype.app = express();
    target.prototype.server = http.createServer(target.prototype.app);
    target.prototype.queue = [];
    if (target.prototype.controllers) {
      target.prototype.controllers = [
        ...target.prototype.controllers,
        ...config.controllers,
      ];
    } else {
      target.prototype.controllers = config.controllers;
    }
    if (!target.prototype.middleware) {
      target.prototype.middleware = [];
    }
    if (config.requestLoggerMiddleware) {
      config.requestLoggerMiddleware.after = false;
      target.prototype.middleware.push(config.requestLoggerMiddleware);
    }
    target.prototype.middleware = [
      ...target.prototype.middleware,
      ...config.middleware,
    ];
    if (config.httpExceptionHandlerMiddleware) {
      config.httpExceptionHandlerMiddleware.after = true;
      target.prototype.middleware.push(config.httpExceptionHandlerMiddleware);
    } else {
      target.prototype.middleware.push(new HttpExceptionHandlerMiddleware());
    }
    if (config.notFoundMiddleware) {
      config.notFoundMiddleware.after = true;
      target.prototype.middleware.push(config.notFoundMiddleware);
    } else {
      target.prototype.middleware.push(new NotFoundMiddleware());
    }
    target.prototype.port = config.port;
    if (config.gateway) {
      const gatewayMiddleware = new MiracleGatewayMiddleware(config.gateway);
      target.prototype.middleware.push(gatewayMiddleware);
    }
    target.prototype.listen = () => {
      new Promise((resolve) => {
        target.prototype.logger.info('', 'Initializing application');
        const interval = setInterval(() => {
          if (PurpleCheetah.isQueueFree() === true) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      }).then(() => {
        target.prototype.logger.info('', 'Starting server...');
        target.prototype.server.listen(
          target.prototype.port,
          (error: Error) => {
            if (error) {
              target.prototype.logger.error('listen', '' + error.stack);
              return;
            }
            target.prototype.logger.info(
              '.listen',
              `Server started on port ${target.prototype.port}.`,
            );
          },
        );
      });
    };
  };
}
