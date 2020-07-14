import { RequestHandler, ErrorRequestHandler } from 'express';
import { MiddlewarePrototype, HttpStatus } from '../../interfaces';
import { Logger } from '../../logging';
import { MiracleGatewayConfig, MiracleRegistryInstance } from '../interfaces';
import { Miracle } from '../miracle';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { HttpErrorFactory } from '../../factories';

export class MiracleGatewayMiddleware implements MiddlewarePrototype {
  uri?: string;
  logger: Logger = new Logger('MiracleGatewayMiddleware');
  after: boolean = false;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;

  constructor(private config: MiracleGatewayConfig) {
    if (!this.config.options) {
      this.config.options = {};
    }
    if (!this.config.options.pathRewrite) {
      this.config.options.pathRewrite = async (path, req) => {
        const sr = this.getServiceAndRouter(path);
        return path.replace(sr.router.uri, '');
      };
    }
    if (!this.config.options.router) {
      this.config.options.router = async (req) => {
        const sr = this.getServiceAndRouter(req.url);
        return sr.serviceInstance.origin;
      };
    }
    if (!this.config.options.onError) {
      this.config.options.onError = (err, req, res) => {
        this.logger.warn(req.url, err);
        res.end();
      };
    }
    this.uri = config.baseUri;
    this.handler = createProxyMiddleware(config.baseUri, {
      target: 'http://localhost:80',
      changeOrigin: true,
      ws: true,
      pathRewrite: config.options.pathRewrite,
      router: config.options.router,
      onError: this.config.options.onError,
      onProxyReq: this.config.options.onProxyReq,
      onProxyRes: this.config.options.onProxyRes,
      onProxyReqWs: this.config.options.onProxyReqWs,
    });
  }

  private getServiceAndRouter(path: string) {
    let uri = `${path}`;
    if (uri.startsWith(this.uri)) {
      uri = uri.replace(this.uri, '');
    }
    const router = this.config.router.find((e) => uri.startsWith(e.uri));
    if (!router) {
      throw HttpErrorFactory.instance(path, this.logger).occurred(
        HttpStatus.SERVICE_UNAVAILABLE,
        `Router does not exist for "${uri}"`,
      );
    }
    let serviceInstance: MiracleRegistryInstance;
    try {
      serviceInstance = Miracle.findRegistryAndUpdatePointer(router.name);
    } catch (error) {
      serviceInstance = undefined;
    }
    if (!serviceInstance) {
      throw HttpErrorFactory.instance(path, this.logger).occurred(
        HttpStatus.SERVICE_UNAVAILABLE,
        'No available instance of the service exist.',
      );
    }
    if (serviceInstance.available === false) {
      throw HttpErrorFactory.instance(path, this.logger).occurred(
        HttpStatus.SERVICE_UNAVAILABLE,
        'Service instance is not available at the moment.',
      );
    }
    return {
      router,
      serviceInstance,
    };
  }
}
