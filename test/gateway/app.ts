import {
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
  MiracleConnect,
  MiracleGatewayMiddleware,
} from '../../src';

@MiracleConnect({
  keyStore: {
    origin: 'http://localhost:1280',
    auth: {
      key: '0',
      secret: 'gateway',
    },
  },
  registry: {
    origin: 'http://localhost:1281',
    service: {
      name: 'gateway',
      origin: `http://localhost:1279`,
      ssl: false,
    },
  },
  gateway: {
    baseUri: '/gateway',
    router: [
      {
        name: 'ms1',
        uri: '/ms1',
      },
    ],
  },
})
@Application({
  port: 1279,
  controllers: [],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
