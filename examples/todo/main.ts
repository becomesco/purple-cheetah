import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createFSDB,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
} from '../../src';

createPurpleCheetah({
  port: 1280,
  middleware: [
    createCorsMiddleware(),
    createBodyParserMiddleware(),
    createRequestLoggerMiddleware(),
  ],
  modules: [createFSDB({})],
});
