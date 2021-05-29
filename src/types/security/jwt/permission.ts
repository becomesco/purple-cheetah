import type { ObjectSchema } from '../../util';

// eslint-disable-next-line no-shadow
export enum JWTPermissionName {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  EXECUTE = 'EXECUTE',
}

export interface JWTPermission {
  name: JWTPermissionName;
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
