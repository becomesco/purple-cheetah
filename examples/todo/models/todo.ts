import { FSDBEntity, FSDBEntitySchema, ObjectSchema } from '../../../src/types';

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
