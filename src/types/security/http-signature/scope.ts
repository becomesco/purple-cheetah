// eslint-disable-next-line no-shadow
export enum HTTPSignatureScopeAlgorithm {
  HMACSHA256 = 'HMACSHA256',
  HMACSHA512 = 'HMACSHA512',
}

export interface HTTPSignatureScope {
  scope: string;
  timestampRange: number;
  secret: string;
  alg: HTTPSignatureScopeAlgorithm;
}
