import { createGraphqlEnum } from '../../../../src';
import { TodoType } from '../model';

export const TodoTypeEnum = createGraphqlEnum({
  name: 'TodoType',
  values: Object.keys(TodoType),
});
