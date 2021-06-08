import { OptionsJson, json } from 'body-parser';
import type { Middleware } from '../../types';
import { createMiddleware } from './main';

/**
 * Creates a JSON body parser using `body-parser` package. See
 * [body-parser](https://www.npmjs.com/package/body-parser) for more
 * information.
 */
export function createBodyParserMiddleware(config?: OptionsJson): Middleware {
  return createMiddleware({
    name: 'Body Parser Middleware',

    after: false,
    handler: () => {
      return json(config);
    },
  });
}
