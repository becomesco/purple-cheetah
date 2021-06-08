import { createGraphqlCollection } from '../../../src';
import { TodoObject } from './objects';
import {
  TodoAddResolver,
  TodoDeleteResolver,
  TodoGetAllResolver,
  TodoGetResolver,
  TodoUpdateResolver,
} from './resolvers';
import { TodoAddDataInput, TodoUpdateData } from './inputs';
import { TodoTypeEnum } from './enums';

export const TodoCollection = createGraphqlCollection({
  name: 'todo',
  enums: [TodoTypeEnum],
  inputs: [TodoAddDataInput, TodoUpdateData],
  objects: [TodoObject],
  resolvers: [
    TodoGetAllResolver,
    TodoGetResolver,
    TodoAddResolver,
    TodoUpdateResolver,
    TodoDeleteResolver,
  ],
});
