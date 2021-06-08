import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createFSDB,
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
  modules: [createFSDB({})],
});
