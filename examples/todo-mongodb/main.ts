import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createMongoDB,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
} from '../../src';
import { TodoController } from './controllers';

createPurpleCheetah({
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
});
