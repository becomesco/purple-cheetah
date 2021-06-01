import { FSDBEntity, FSDBEntitySchema, ObjectSchema } from '../../../src/types';

// eslint-disable-next-line no-shadow
export enum TodoType {
  IMPORTANT = 'IMPORTANT',
  FLEXIBLE = 'FLEXIBLE',
}

export interface TodoModel extends FSDBEntity {
  name: string;
  description: string;
  completed: boolean;
  type: TodoType;
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
  type: {
    __type: 'string',
    __required: true,
  },
};

export interface TodoAddData {
  name: string;
  description: string;
  type: TodoType;
}

export interface TodoUpdateData {
  _id: string;
  name?: string;
  description?: string;
  completed?: boolean;
  type?: TodoType;
}
