import { JWTHeader, JWTHeaderSchema } from './header';
import { JWTPayload, JWTPayloadSchema } from './payload';
import type { JWTRole, JWTRoleName } from './role';
import type { JWTPermissionName } from './permission';
import type { JWTInfo } from './info';
import type { ObjectSchema } from '../../util';

export interface JWT<T> {
  header: JWTHeader;
  payload: JWTPayload<T>;
  signature: string;
}
export const JWTSchema: ObjectSchema = {
  header: {
    __type: 'object',
    __required: true,
    __child: JWTHeaderSchema,
  },
  payload: {
    __type: 'object',
    __required: true,
    __child: JWTPayloadSchema,
  },
};

export interface JWTManagerConfig {
  jwtInfo: JWTInfo[];
}

export interface JWTManagerCreateData<T> {
  issuer: string;
  userId: string;
  roles: JWTRole[];
  props?: T;
}
export interface JWTManagerCheckPermissionsData<T> {
  jwt: JWT<T>;
  roleNames: JWTRoleName[];
  permissionName: JWTPermissionName;
}
export interface JWTManagerGetData {
  jwtString: string;
  roleNames: JWTRoleName[];
  permissionName: JWTPermissionName;
}

export interface JWTManager {
  create<T>(data: JWTManagerCreateData<T>): JWT<T> | Error;
  sign<T>(jwt: JWT<T>): JWT<T> | Error;
  validate<T>(jwt: JWT<T>): void | Error;
  checkPermissions<T>(data: JWTManagerCheckPermissionsData<T>): void | Error;
  validateAndCheckPermissions<T>(
    data: JWTManagerCheckPermissionsData<T>,
  ): void | Error;
  get<T>(data: JWTManagerGetData): Error | JWT<T>;
}
