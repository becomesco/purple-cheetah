import { Options } from 'http-proxy-middleware';

export interface MiracleV2GatewayConfig {
  baseUri?: string;
  target: string;
  router: Array<{
    uri: string;
    name: string;
    rewriteBase?: boolean;
  }>;
  options?: Options;
}
