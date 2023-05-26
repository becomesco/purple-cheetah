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
  createComponents,
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
    const docComponents = createComponents({
      BasicBody: {
        yourMessage: {
          __type: 'string',
          __required: true,
        },
      },
      BasicResponse: {
        message: {
          __type: 'string',
          __required: true,
        },
      },
    });
    type Components = typeof docComponents;
    return await new Promise<void>((resolve) => {
      app = createPurpleCheetah({
        port: 1280,
        doc: {
          name: 'Test docs',
          components: docComponents,
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
                  doc: createDocObject<Components>({
                    description: 'Say Hello!',
                    body: {
                      json: 'BasicBody',
                    },
                    query: {
                      join: {
                        __type: 'string',
                        __required: true,
                      },
                    },
                    response: {
                      json: 'BasicResponse',
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
