import { Options } from 'http-proxy-middleware';

export interface MiracleGatewayConfig {
  baseUri?: string;
  router: Array<{
    uri: string;
    name: string;
    rewriteBase?: boolean;
  }>;
  options?: Options;
}
