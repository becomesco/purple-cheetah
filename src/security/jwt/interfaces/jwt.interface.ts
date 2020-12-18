import { JWTPayload } from './jwt-payload.interface';
import { JWTHeader } from './jwt-header.interface';

export interface JWT<T> {
  header: JWTHeader;
  payload: JWTPayload<T>;
  signature: string;
}
