import { AxiosError } from 'axios';

export interface MiracleRequestError {
  type: 'axios' | 'internal';
  error: AxiosError | any;
}
