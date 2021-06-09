import type { ObjectSchema } from '../../../src/types';
import { FSDBEntity, FSDBEntitySchema } from '@becomes/purple-cheetah-mod-fsdb';

export interface Todo extends FSDBEntity {
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

export interface AddTodoData {
  name: string;
  description: string;
}
export const AddTodoDataSchema: ObjectSchema = {
  name: {
    __type: 'string',
    __required: true,
  },
  description: {
    __type: 'string',
    __required: true,
  },
};

export interface UpdateTodoData {
  _id: string;
  name?: string;
  description?: string;
  completed?: boolean;
}
export const UpdateTodoDataSchema: ObjectSchema = {
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
