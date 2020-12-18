import { Role } from './jwt-role.interface';

export interface JWTPayload<T> {
  jti: string;
  iss: string;
  iat: number;
  exp: number;
  userId: string;
  roles: Role[];
  customPool: T;
}
