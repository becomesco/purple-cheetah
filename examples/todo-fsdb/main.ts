import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
} from '../../src';
import { TodoController } from './controllers';
import { createFSDB } from '@becomes/purple-cheetah-mod-fsdb/main';

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
