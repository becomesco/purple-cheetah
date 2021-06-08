import { createFSDBRepository } from '../../../src';
import { TodoModel, TodoSchema } from './model';

export interface TodoRepositoryMethods {
  findAllByCompleted(completed: boolean): Promise<TodoModel[]>;
}
export const TodoRepository = createFSDBRepository<
  TodoModel,
  TodoRepositoryMethods
>({
  name: 'Todo Repository',
  collection: 'todo-fsdb',
  schema: TodoSchema,
  methods({ repo }) {
    return {
      async findAllByCompleted(completed) {
        return await repo.findAllBy((e) => e.completed === completed);
      },
    };
  },
});
