import { expect } from 'chai';
import { PurpleCheetah, HttpClientResponseError } from '../../src/types';
import {
  createBodyParserMiddleware,
  createCorsMiddleware,
  createPurpleCheetah,
  createRequestLoggerMiddleware,
  createHttpClient,
  removeHttpClient,
  createController,
  createControllerMethod,
  createDocObject,
} from '../../src';

describe('REST API - Hello world', async () => {
  let app: PurpleCheetah;
  const http = createHttpClient({
    name: 'Hello World',
    host: {
      name: 'localhost',
      port: '1280',
    },
  });
  before('start server', async () => {
    return await new Promise<void>((resolve) => {
      app = createPurpleCheetah({
        port: 1280,
        doc: {
          name: 'Test docs',
          components: {},
        },
        logger: {
          doNotOverrideProcess: true,
        },
        controllers: [
          createController({
            name: 'Basic',
            path: '/basic',
            methods() {
              return {
                hello: createControllerMethod<void, { ok: boolean }>({
                  path: '/hello',
                  type: 'get',
                  doc: createDocObject({
                    description: 'Say Hello!',
                    response: {
                      json: {
                        ok: {
                          __type: 'boolean',
                          __required: true,
                        },
                      },
                    },
                  }),
                  async handler() {
                    return {
                      ok: true,
                    };
                  },
                }),
              };
            },
          }),
        ],
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
  after('close server', async () => {
    console.log('c serv');
    await new Promise<void>((resolve, reject) => {
      app.getServer().close((err) => {
        if (err) {
          reject(err);
        } else resolve();
      });
    });
    console.log('c serv done');
    removeHttpClient('Hello World');
  });
  it('should call /basic/hello', async () => {
    const res = await http.send<{ message: string }>({
      path: '/basic/hello',
      method: 'get',
    });
    if (res instanceof HttpClientResponseError) {
      throw res;
    }
    expect(res).to.have.property('data').to.have.property('ok', true);
  });
});
