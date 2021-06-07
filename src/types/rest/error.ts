import type { Logger } from '../util/logger';

// eslint-disable-next-line no-shadow
export enum HTTPStatus {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUNT = 404,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * Object understandable by the Purple Cheetah controller method wrapper.
 * If this object is thrown from a controller method handler, exception
 * payload will be sent to the client and information about exception
 * will be logged.
 */
export class HTTPException<T> {
  constructor(
    /**
     * Status of the response (non 200)
     */
    public status: HTTPStatus | number,
    /**
     * Message/payload which will be sent to the client.
     */
    public message: T | { message: T },
    /**
     * Error stack.
     */
    public stack: string[],
  ) {}
}

export interface HTTPErrorConfig {
  /**
   * Place in the code where error handler is used.
   */
  place: string;
  /**
   * Parent logger object or any Purple Cheetah logger object.
   */
  logger: Logger;
}

/**
 * Object for generating controller exception objects.
 */
export interface HTTPError extends HTTPErrorConfig {
  occurred<T>(status: HTTPStatus | number, message: T): HTTPException<T>;
}
