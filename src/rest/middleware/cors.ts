import * as cors from 'cors';
import type { Middleware } from '../../types';
import { createMiddleware } from './main';

/**
 * Creates a CORS middleware using `cors` package. Please see
 * [cors](https://www.npmjs.com/package/cors) from more information.
 */
export function createCorsMiddleware(config?: cors.CorsOptions): Middleware {
  return createMiddleware({
    name: 'CORS Middleware',
    after: false,
    handler: () => {
      return cors(config);
    },
  });
}
