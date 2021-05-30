import { expect } from 'chai';
import { PurpleCheetah, HttpClientResponseError } from '../../src/types';
import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
  createHttpClient,
  removeHttpClient,
} from '../../src';
import { HelloWorldController } from '../../examples/hello-world/controller';

describe('REST API - Hello world', async () => {
  let app: PurpleCheetah;
  const http = createHttpClient({
    name: 'Hello World',
    host: {
      name: 'localhost',
      port: '1280',
    },
  });
  before(async () => {
    return await new Promise<void>((resolve) => {
      app = createPurpleCheetah({
        port: 1280,
        controllers: [HelloWorldController],
        middleware: [
          createRequestLoggerMiddleware(),
          createBodyParserMiddleware(),
          createCorsMiddleware(),
        ],
        onReady() {
          resolve();
        },
      });
    });
  });
  after(async () => {
    app.server.close();
    removeHttpClient('Hello World');
  });
  it('should start the server', async () => {
    expect(app).to.have.property('app');
  });
  it('should class /hello/world', async () => {
    const res = await http.send<{ message: string }, unknown>({
      path: '/hello/world',
      method: 'get',
    });
    if (res instanceof HttpClientResponseError) {
      throw res;
    }
    expect(res)
      .to.have.property('data')
      .to.have.property('message', 'Hello World!');
  });
  it('should class /hello/this-is-test', async () => {
    const res = await http.send<{ message: string }, unknown>({
      path: '/hello/this-is-test',
      method: 'get',
    });
    if (res instanceof HttpClientResponseError) {
      throw res;
    }
    expect(res)
      .to.have.property('data')
      .to.have.property('message', 'Hello this-is-test!');
  });
});
