import {
  createGraphqlCollection,
  createGraphqlResponseObject,
} from '../../../src';
import { TodoObject } from './objects';
import { TodoGetAllResolver } from './resolvers';

export const TodoCollection = createGraphqlCollection({
  name: 'Todo',
  objects: [
    createGraphqlResponseObject({ name: 'TodoArray', type: '[Todo!]' }).object,
    TodoObject,
  ],
  resolvers: [TodoGetAllResolver],
});
