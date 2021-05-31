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
export class HTTPException<T> {
  constructor(
    public status: HTTPStatus | number,
    public message: T | { message: T },
    public stack: unknown,
  ) {}
}
export interface HTTPErrorConfig {
  place: string;
  logger: Logger;
}
export interface HTTPError extends HTTPErrorConfig {
  occurred<T>(status: HTTPStatus | number, message: T): HTTPException<T>;
}
