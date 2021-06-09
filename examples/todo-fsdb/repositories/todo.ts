import { Todo, TodoSchema } from '../models';
import { createFSDBRepository } from '@becomes/purple-cheetah-mod-fsdb/repository';

export interface TodoRepositoryMethods {
  findAllByCompleted(completed: boolean): Promise<Todo[]>;
}
export const TodoRepository = createFSDBRepository<Todo, TodoRepositoryMethods>(
  {
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
  },
);
