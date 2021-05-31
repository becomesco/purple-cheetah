import { createMongoDBRepository } from '../../../src';
import { Todo, TodoDocument, TodoSchema } from '../models';

export interface TodoRepositoryMethods {
  findAllByCompleted(completed: boolean): Promise<Todo[]>;
}
export const TodoRepository = createMongoDBRepository<
  Todo,
  TodoDocument,
  TodoRepositoryMethods
>({
  name: 'Todo Repository',
  collection: 'todo',
  schema: TodoSchema,
  methods({ repo }) {
    return {
      async findAllByCompleted(completed) {
        return await repo.findAllBy({ completed });
      },
    };
  },
});
