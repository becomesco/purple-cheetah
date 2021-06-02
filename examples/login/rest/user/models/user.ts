import {
  FSDBEntity,
  JWTRole,
  ObjectSchema,
  FSDBEntitySchema,
  JWTRoleSchema,
} from '../../../../../src/types';
import { UserPersonal, UserPersonalSchema } from './personal';

export interface User extends FSDBEntity {
  username: string;
  email: string;
  password: string;
  roles: JWTRole[];
  personal: UserPersonal;
}

export const UserSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  username: {
    __type: 'string',
    __required: true,
  },
  email: {
    __type: 'string',
    __required: true,
  },
  password: {
    __type: 'string',
    __required: true,
  },
  roles: {
    __type: 'array',
    __required: true,
    __child: {
      __type: 'object',
      __content: JWTRoleSchema,
    },
  },
  personal: {
    __type: 'object',
    __required: true,
    __child: UserPersonalSchema,
  },
};
