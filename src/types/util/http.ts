import type { IncomingHttpHeaders, IncomingMessage } from 'http';

export interface HttpConfig {
  host?: {
    name: string;
    port?: string;
  };
  path: string;
  method: 'get' | 'post' | 'put' | 'delete';
  headers?: { [key: string]: string };
  data?: unknown;
}
export interface HttpResponse<T> {
  status: number;
  data: T;
  headers: IncomingHttpHeaders;
}
export interface HttpResponseError {
  status: number;
  headers: IncomingHttpHeaders;
  data: unknown;
  err: Error | IncomingMessage;
}
