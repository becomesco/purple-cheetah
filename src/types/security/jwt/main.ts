import type { JWTHeader } from './header';
import type { JWTPayload } from './payload';

export interface JWT<T> {
  header: JWTHeader;
  payload: JWTPayload<T>;
  signature: string;
}
