// eslint-disable-next-line no-shadow
import type { ObjectSchema } from '../../util';

export enum JWTPermissionName {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE',
}

export interface JWTPermission {
  name: PermissionName;
}

export const JWTPermissionSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
    __validate(value: string) {
      const keys = Object.keys(JWTPermissionName);
      return keys.includes(value);
    },
  },
};
