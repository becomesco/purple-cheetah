import type { PurpleCheetah } from '../../src/types';
import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
} from '../../src';
import { HelloWorldController } from '../../examples/hello-world/controller';

describe('REST API - Hello world', async () => {
  let app: PurpleCheetah;
  before(async () => {
    app = createPurpleCheetah({
      port: 1280,
      controllers: [HelloWorldController],
      middleware: [
        createRequestLoggerMiddleware(),
        createBodyParserMiddleware(),
        createCorsMiddleware(),
      ],
    });
  });
});
