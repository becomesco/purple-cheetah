import { RequestHandler, ErrorRequestHandler } from 'express';
import { Logger } from '../logging';

export function Middleware(config: {
  uri?: string;
  after?: boolean;
  handler?: RequestHandler | RequestHandler[] | ErrorRequestHandler;
}) {
  return (target: any) => {
    if (typeof config.uri === 'string') {
      if (config.uri.startsWith('/') === false) {
        target.prototype.uri = `/${config.uri}`;
      } else {
        target.prototype.uri = config.uri;
      }
    }
    target.prototype.after = config.after === true ? true : false;
    if (config.handler) {
      target.prototype.handler = config.handler;
    }
    target.prototype.logger = new Logger(target.name);
  };
}
