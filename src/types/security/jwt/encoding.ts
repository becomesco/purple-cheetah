import type { JWT } from './main';

export interface JWTEncoding {
  encode<T>(jwt: JWT<T>): string;
  decode<T>(encodedJwt: string): JWT<T> | Error;
}
