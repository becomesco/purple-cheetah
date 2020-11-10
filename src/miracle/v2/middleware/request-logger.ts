import { NextFunction, Request, Response } from 'express';
import { Middleware } from '../../../decorators';
import { MiddlewarePrototype } from '../../../interfaces';
import { Logger } from '../../../logging';

@Middleware({
  after: false,
})
export class MiracleV2RequestLogger implements MiddlewarePrototype {
  after: boolean;
  logger: Logger;
  uri?: string;
  handler = (request: Request, reponse: Response, next: NextFunction) => {
    if (request.url !== '/miracle/heartbeat') {
      this.logger.info('', `${request.method}: ${request.url}`);
    }
    next();
  };
}
