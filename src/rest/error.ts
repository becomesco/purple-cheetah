import type { HTTPError, HTTPErrorConfig } from '../types';

export function createHTTPError(config: HTTPErrorConfig): HTTPError {
  return {
    place: config.place,
    logger: config.logger,
    occurred(status, message) {
      config.logger.warn(config.place, message);
      return {
        status,
        stack: new Error().stack,
        message: typeof message === 'object' ? message : { message },
      };
    },
  };
}
