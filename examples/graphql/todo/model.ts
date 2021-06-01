import { FSDBEntity, FSDBEntitySchema, ObjectSchema } from '../../../src/types';

export interface TodoModel extends FSDBEntity {
  name: string;
  description: string;
  completed: boolean;
}
export const TodoSchema: ObjectSchema = {
  ...FSDBEntitySchema,
  name: {
    __type: 'string',
    __required: true,
  },
  description: {
    __type: 'string',
    __required: true,
  },
  completed: {
    __type: 'boolean',
    __required: true,
  },
};

export interface TodoAddData {
  name: string;
  description: string;
}
export const TodoAddDataSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  description: {
    __type: 'string',
    __required: true,
  },
};

export interface TodoUpdateData {
  _id: string;
  name?: string;
  description?: string;
  completed?: boolean;
}
export const TodoUpdateDataSchema: ObjectSchema = {
  _id: {
    __type: 'string',
    __required: true,
  },
  name: {
    __type: 'string',
    __required: false,
  },
  description: {
    __type: 'string',
    __required: false,
  },
  completed: {
    __type: 'boolean',
    __required: false,
  },
};
