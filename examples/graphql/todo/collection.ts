import { createGraphqlCollection } from '../../../src';
import { TodoObject } from './objects';
import { TodoAddResolver, TodoGetAllResolver } from './resolvers';
import { TodoAddDataInput } from './inputs';

export const TodoCollection = createGraphqlCollection({
  name: 'todo',
  inputs: [TodoAddDataInput],
  objects: [TodoObject],
  resolvers: [TodoAddResolver, TodoGetAllResolver],
});
