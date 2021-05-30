import {
  HttpClient,
  HttpClientConfig,
  HttpClientHeaders,
  HttpClientQuery,
  HttpClientRequestConfig,
  HttpClientResponse,
  HttpClientResponseError,
} from '../types';
import { request as httpRequest, RequestOptions } from 'http';
import { request as httpsRequest } from 'https';

const clients: {
  [name: string]: HttpClient;
} = {};

export function createHttpClient(config: HttpClientConfig): HttpClient {
  const basePath = config.basePath ? config.basePath : '';
  const headers = config.headers ? config.headers : {};
  const query = config.query ? config.query : {};
  const defaultHost = config.host ? config.host.name : 'localhost';
  const defaultPort = config.host && config.host.port ? config.host.port : '80';
  const client: HttpClient = {
    async send<T, K, R>(
      conf: HttpClientRequestConfig<K>,
    ): Promise<HttpClientResponse<T> | HttpClientResponseError<R>> {
      return await new Promise<
        HttpClientResponse<T> | HttpClientResponseError<R>
      >((resolve, reject) => {
        const requestConfig: RequestOptions = {
          host: conf.host ? conf.host.name : defaultHost,
          port: conf.host && conf.host.port ? conf.host.port : defaultPort,
          headers: conf.headers
            ? { ...headers, ...conf.headers }
            : { ...headers },
          method: conf.method,
          path: `${basePath}${conf.path}`,
        };
        let data: string | undefined = undefined;
        if (typeof conf.data === 'object') {
          data = JSON.stringify(conf.data);
          (requestConfig.headers as HttpClientHeaders)['content-type'] =
            'application/json';
        } else if (typeof conf.data !== 'undefined') {
          data = `${conf.data}`;
          (requestConfig.headers as HttpClientHeaders)['content-type'] =
            'text/plain';
        }
        const q: HttpClientQuery = conf.query
          ? { ...query, ...conf.query }
          : { ...query };
        const queryString = Object.keys(q)
          .map((e) => `${e}=${encodeURIComponent(q[e])}`)
          .join('&');
        if (queryString !== '') {
          if (conf.path.indexOf('?') !== -1) {
            requestConfig.path += '&' + queryString;
          } else {
            requestConfig.path += '?' + queryString;
          }
        }
        const sender =
          config.host && config.host.port
            ? config.host.port === '443'
              ? httpsRequest
              : httpRequest
            : defaultPort === '443'
            ? httpsRequest
            : httpRequest;

        const request = sender(requestConfig, (res) => {
          let rawData = '';
          res.on('data', (chunk) => {
            rawData += chunk;
          });
          res.on('error', (err) => {
            const output = new HttpClientResponseError(
              res.statusCode ? res.statusCode : 0,
              res.headers,
              res.headers['content-type'] === 'application/json'
                ? JSON.parse(rawData)
                : rawData,
              err,
            );
            resolve(output);
            return;
          });
          res.on('end', () => {
            if (res.statusCode !== 200) {
              const output = new HttpClientResponseError(
                res.statusCode ? res.statusCode : 0,
                res.headers,
                res.headers['content-type'] === 'application/json'
                  ? JSON.parse(rawData)
                  : rawData,
                res,
              );
              resolve(output);
              return;
            }
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data:
                res.headers['content-type'] &&
                res.headers['content-type'].indexOf('application/json') !== -1
                  ? JSON.parse(rawData)
                  : rawData,
            });
          });
        });
        request.on('error', (e) => {
          reject(e);
        });
        if (typeof data !== 'undefined') {
          request.write(data);
        }
        request.end();
      });
    },
  };
  clients[config.name] = client;

  return { ...client };
}

export function useHttpClient(name: string): HttpClient {
  const client = clients[name];
  if (!client) {
    throw Error(`HTTP client with name "${name}" does not exist.`);
  }
  return client;
}

export function removeHttpClient(name: string): void {
  delete clients[name];
}
