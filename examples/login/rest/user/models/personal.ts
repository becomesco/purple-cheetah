import type { ObjectSchema } from '../../../../../src/types';

export interface UserPersonal {
  firstName: string;
  lastName: string;
}

export const UserPersonalSchema: ObjectSchema = {
  firstName: {
    __type: 'string',
    __required: true,
  },
  lastName: {
    __type: 'string',
    __required: true,
  },
};
