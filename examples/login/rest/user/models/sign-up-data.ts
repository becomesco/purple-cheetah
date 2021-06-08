import type { ObjectSchema } from '../../../../../src/types';

export interface UserSignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const UserSignUpDataSchema: ObjectSchema = {
  email: {
    __type: 'string',
    __required: true,
  },
  password: {
    __type: 'string',
    __required: true,
  },
  firstName: {
    __type: 'string',
    __required: true,
  },
  lastName: {
    __type: 'string',
    __required: true,
  },
};
