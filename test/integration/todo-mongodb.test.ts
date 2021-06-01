import {
  HttpClientResponse,
  PurpleCheetah,
  HttpClientResponseError,
} from '../../src/types';
import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createHttpClient,
  createMongoDB,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
  removeHttpClient,
} from '../../src';
import { TodoController } from '../../examples/todo-mongodb/controllers';
import { expect } from 'chai';
import type {
  AddTodoData,
  Todo,
  UpdateTodoData,
} from '../../examples/todo-mongodb/models';

describe('REST API - Model MongoDB', async () => {
  let app: PurpleCheetah;
  const http = createHttpClient({
    name: 'todo',
    host: {
      name: 'localhost',
      port: '1280',
    },
    basePath: '/todo',
  });
  let todoId: string;

  before(async () => {
    return await new Promise<void>((resolve) => {
      app = createPurpleCheetah({
        port: 1280,
        controllers: [TodoController],
        middleware: [
          createCorsMiddleware(),
          createBodyParserMiddleware(),
          createRequestLoggerMiddleware(),
        ],
        modules: [
          createMongoDB({
            collectionsPrefix: 'todo',
            atlas: {
              user: {
                name: process.env.MONGODB_USER as string,
                password: process.env.MONGODB_PASS as string,
              },
              db: {
                name: process.env.MONGODB_NAME as string,
                cluster: process.env.MONGODB_CLUSTER as string,
                readWrite: true,
              },
            },
          }),
        ],
        onReady() {
          resolve();
        },
      });
    });
  });
  after(async () => {
    app.server.close();
    removeHttpClient('todo');
  });

  it('should check if server is started', async () => {
    expect(app).to.have.property('app');
  });
  it('should create a todo item', async () => {
    const data: AddTodoData = {
      name: 'todo 1',
      description: 'This is todo 1',
    };
    const res: HttpClientResponse<{ item: Todo }> = await http.send({
      path: '',
      method: 'post',
      data,
    });
    if (res instanceof HttpClientResponseError) {
      throw res;
    }
    expect(res.data).to.have.property('item');
    expect(res.data.item).to.have.property('_id');
    expect(res.data.item).to.have.property('name', 'todo 1');
    expect(res.data.item).to.have.property('description', 'This is todo 1');
    expect(res.data.item).to.have.property('completed', false);

    todoId = res.data.item._id as never;
  });
  it('should get created todo', async () => {
    const res: HttpClientResponse<{ item: Todo }> = await http.send({
      path: `/${todoId}`,
      method: 'get',
    });
    if (res instanceof HttpClientResponseError) {
      throw res;
    }
    expect(res.data).to.have.property('item');
    expect(res.data.item).to.have.property('_id', todoId);
    expect(res.data.item).to.have.property('name', 'todo 1');
    expect(res.data.item).to.have.property('description', 'This is todo 1');
    expect(res.data.item).to.have.property('completed', false);
  });
  it('should update todo', async () => {
    const data: UpdateTodoData = {
      _id: todoId,
      completed: true,
      name: 'todo',
      description: 'desc',
    };
    const res: HttpClientResponse<{ item: Todo }> = await http.send({
      path: '/',
      method: 'put',
      data,
    });
    if (res instanceof HttpClientResponseError) {
      throw res;
    }
    expect(res.data).to.have.property('item');
    expect(res.data.item).to.have.property('_id', todoId);
    expect(res.data.item).to.have.property('name', 'todo');
    expect(res.data.item).to.have.property('description', 'desc');
    expect(res.data.item).to.have.property('completed', true);
  });
  it('should delete todo', async () => {
    const res: HttpClientResponse<void> = await http.send({
      path: `/${todoId}`,
      method: 'delete',
    });
    if (res instanceof HttpClientResponseError) {
      throw res;
    }
    const todo: HttpClientResponse<{ item: Todo }> = await http.send({
      path: `/${todoId}`,
      method: 'get',
    });

    expect(todo).to.have.property('status', 404);
  });
});
