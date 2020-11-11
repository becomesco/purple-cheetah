import { createProxyMiddleware } from 'http-proxy-middleware';
import { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpStatus, MiddlewarePrototype } from '../../../interfaces';
import { Logger } from '../../../logging';
import { MiracleV2GatewayConfig } from '../types';
import { HttpErrorFactory } from '../../../factories';
import { MiracleV2 } from '../miracle';

export class MiracleV2GatewayMiddleware implements MiddlewarePrototype {
  uri?: string;
  after = false;
  logger = new Logger('MiracleV2GatewayMiddleware');
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;

  constructor(config: MiracleV2GatewayConfig) {
    if (!config.options) {
      config.options = {};
    }
    const getServiceOriginAndRouter = async (path: string) => {
      let uri = `${path}`;
      if (uri.startsWith(this.uri)) {
        uri = uri.replace(this.uri, '');
      }
      const router = config.router.find((e) => uri.startsWith(e.uri));
      if (!router) {
        throw HttpErrorFactory.instance(path, this.logger).occurred(
          HttpStatus.SERVICE_UNAVAILABLE,
          `Router does not exist for "${uri}"`,
        );
      }
      let serviceInstanceOrigin: string;
      try {
        serviceInstanceOrigin = await MiracleV2.getServiceOrigin(router.name);
      } catch (e) {
        serviceInstanceOrigin = undefined;
      }
      if (!serviceInstanceOrigin) {
        throw HttpErrorFactory.instance(path, this.logger).occurred(
          HttpStatus.SERVICE_UNAVAILABLE,
          'No available instance of the service exist.',
        );
      }
      return {
        router,
        serviceOrigin: serviceInstanceOrigin,
      };
    };
    if (!config.options.pathRewrite) {
      config.options.pathRewrite = async (path) => {
        const result = await getServiceOriginAndRouter(path);
        return path.replace(`${this.uri}${result.router.uri}`, '');
      };
    }
    if (!config.options.router) {
      config.options.router = async (req) => {
        const result = await getServiceOriginAndRouter(req.url);
        return result.serviceOrigin;
      };
    }
    if (!config.options.onError) {
      config.options.onError = (err, req, res) => {
        this.logger.warn(req.url, err);
        res.end();
      };
    }
    this.uri = config.baseUri;
    this.handler = createProxyMiddleware(config.baseUri, {
      target: config.target,
      changeOrigin: true,
      ws: true,
      pathRewrite: config.options.pathRewrite,
      router: config.options.router,
      onError: config.options.onError,
      onProxyReq: config.options.onProxyReq,
      onProxyRes: config.options.onProxyRes,
      onProxyReqWs: config.options.onProxyReqWs,
    });
  }
}
