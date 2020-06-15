import * as proxy from 'express-http-proxy';
import {
  RequestHandler,
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from 'express';
import { MiddlewarePrototype } from '../../interfaces';
import { Logger } from '../../logging';
import {
  MiracleGatewayConfig,
  MiracleRegistryExtended,
  MiracleRegistryInstance,
} from '../interfaces';
import { Miracle } from '../miracle';

export class MiracleGatewayMiddleware implements MiddlewarePrototype {
  uri?: string;
  logger: Logger = new Logger('MiracleGatewayMiddleware');
  after: boolean = false;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;
  private registries: MiracleRegistryExtended[];
  private registryHash: string = '';

  constructor(config: MiracleGatewayConfig) {
    this.uri = config.baseUri;
    this.handler = async (
      request: Request,
      response: Response,
      next: NextFunction,
    ) => {
      const uri = request.url;
      const router = config.router.find((e) => uri.startsWith(e.uri));
      if (!router) {
        next();
        return;
      }
      let serviceInstance: MiracleRegistryInstance;
      try {
        serviceInstance = Miracle.findRegistryAndUpdatePointer(router.name);
      } catch (error) {
        serviceInstance = undefined;
      }
      if (!serviceInstance) {
        response.status(502);
        response.json({
          message: 'No available instance of the service exist.',
        });
        response.end();
        return;
      }
      if (serviceInstance.available === false) {
        response.status(503);
        response.json({
          message: 'Service instance is not available at the moment.',
        });
        response.end();
        return;
      }
      proxy(serviceInstance.origin, {
        parseReqBody: true,
        preserveHostHdr: true,
        proxyReqOptDecorator: (req) => {
          req.method = request.method;
          return req;
        },
        proxyReqPathResolver: (req) => {
          req.query = request.query;
          if (router.rewriteBase === false) {
            return req.url;
          }
          let url = req.url.replace(router.uri, '');
          if (url.startsWith('?')) {
            url = '/' + url;
          }
          return url;
        },
        proxyErrorHandler: (err, res, nextFn) => {
          if (err.code === 'ECONNREFUSED') {
            res.status(503);
            res.json({
              message: 'Service unavailable.',
            });
            res.end();
            return;
          }
          this.logger.info('here', res);
          nextFn(err);
        },
      })(request, response, next);
    };
  }
}
