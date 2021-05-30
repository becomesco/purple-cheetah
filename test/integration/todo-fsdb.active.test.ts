import type { PurpleCheetah } from '../../src/types';
import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createFSDB,
  createHttpClient,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
  initializeFS,
  initializeLogger,
  removeHttpClient,
  useFS,
} from '../../src';
import { TodoController } from '../../examples/todo-fsdb/controllers';
import { expect } from 'chai';
import type { Todo } from '../../examples/todo-fsdb/models';

describe('REST API - Todo FSDB', async () => {
  let app: PurpleCheetah;
  const http = createHttpClient({
    name: 'todo',
    host: {
      name: 'localhost',
      port: '1280',
    },
  });

  before(async () => {
    initializeFS();
    initializeLogger();
    const fs = useFS();
    const db = await fs.read('test/assets/db/todo.fsdb.json');
    await fs.save('test/assets/db/_todo.fsdb.json', db);
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
          createFSDB({
            output: 'test/assets/db/_todo',
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
    const todo: Todo
  })
});
