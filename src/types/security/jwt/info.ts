import type { JWTAlgorithm } from './header';

export interface JWTInfo {
  secret: string;
  expIn: number;
  issuer: string;
  alg: JWTAlgorithm;
}
