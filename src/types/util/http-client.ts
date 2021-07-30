import type { IncomingHttpHeaders, IncomingMessage } from 'http';

export type HttpClientRequestMethod = 'get' | 'post' | 'put' | 'delete';

export interface HttpClientQuery {
  [key: string]: string;
}
export interface HttpClientHeaders {
  [key: string]: string;
}

export interface HttpClientConfig {
  name: string;
  host?: {
    name: string;
    port?: string;
  };
  query?: HttpClientQuery;
  headers?: HttpClientHeaders;
  basePath?: string;
}

export interface HttpClientRequestConfig<T> {
  path: string;
  method: HttpClientRequestMethod;
  host?: {
    name: string;
    port?: string;
  };
  query?: HttpClientQuery;
  headers?: HttpClientHeaders;
  data?: T;
}

export interface HttpClientResponse<T> {
  status: number;
  data: T;
  headers: IncomingHttpHeaders;
}

export class HttpClientResponseError<T> {
  constructor(
    public status: number,
    public headers: IncomingHttpHeaders,
    public data: T,
    public err: Error | IncomingMessage,
  ) {}
}

export interface HttpClient {
  send<T, K, R>(
    config: HttpClientRequestConfig<K>,
  ): Promise<HttpClientResponse<T> | HttpClientResponseError<R>>;
}
