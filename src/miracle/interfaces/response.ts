import { MiracleRequestError } from './request-error';

export interface MiracleResponseSuccess {
  data: any;
  headers: any;
}

export interface MiracleResponse {
  success: boolean;
  response: MiracleResponseSuccess | MiracleRequestError;
}
