import * as cors from 'cors';
import type { Middleware } from '../../types';
import { createMiddleware } from './main';

export function createCorsMiddleware(config?: cors.CorsOptions): Middleware {
  return createMiddleware({
    name: 'CORS Middleware',
    after: false,
    handler: () => {
      return cors(config);
    },
  });
}
