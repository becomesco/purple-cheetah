import { RequestHandler, ErrorRequestHandler } from 'express';
import { buildSchema } from 'graphql';
import * as graphqlHTTP from 'express-graphql';
import { MiddlewarePrototype } from '../../interfaces';
import { Logger } from '../../logging';

export class QLMiddleware implements MiddlewarePrototype {
  uri?: string;
  logger: Logger;
  after: boolean = false;
  handler: RequestHandler | RequestHandler[] | ErrorRequestHandler;

  constructor(config: {
    uri?: string;
    schema: string;
    rootValue: any;
    graphiql: boolean;
  }) {
    if (config.uri) {
      this.uri = config.uri;
    }
    const schema = buildSchema(config.schema);
    this.handler = graphqlHTTP((req, res) => {
      if (req.headers['x-proxy-timer-time']) {
        res.setHeader('x-proxy-timer-time', req.headers['x-proxy-timer-time']);
      }
      return {
        schema,
        rootValue: config.rootValue,
        graphiql: config.graphiql,
      };
    });
  }
}
