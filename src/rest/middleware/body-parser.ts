import { OptionsJson, json } from 'body-parser';
import type { Middleware } from '../../types';
import { createMiddleware } from './main';

export function createBodyParserMiddleware(config?: OptionsJson): Middleware {
  return createMiddleware({
    name: 'Body Parser Middleware',
    after: false,
    handler: () => {
      return json(config);
    },
  });
}
