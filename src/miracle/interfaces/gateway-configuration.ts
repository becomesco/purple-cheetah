export interface MiracleGatewayConfig {
  baseUri?: string;
  router: Array<{
    uri: string;
    name: string;
    rewriteBase?: boolean;
  }>;
}
