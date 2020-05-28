import {
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
  MiracleConnect,
  EnableGraphQL,
  EnableMongoDB,
} from '../../src';
import { Test } from './controller';
import { QLTest } from './graphql/gql';
import { CacheController } from './cache-controller';

@EnableMongoDB({
  selfHosted: {
    db: {
      host: 'localhost',
      name: 'test',
      port: 27017,
    },
    user: {
      name: 'test',
      password: 'test1234',
    },
  },
  onInitialize: () => {
    CacheController.init();
  },
})
// @EnableGraphQL({
//   graphiql: true,
//   rootName: 'MS1',
//   uri: '/gql',
//   entries: [new QLTest()],
// })
// @MiracleConnect({
//   keyStore: {
//     origin: 'http://localhost:1280',
//     auth: {
//       key: '2',
//       secret: 'ms1',
//     },
//   },
//   registry: {
//     origin: 'http://localhost:1281',
//     service: {
//       name: 'ms1',
//       origin: `http://localhost:${process.env.PORT}`,
//       ssl: false,
//     },
//   },
// })
@Application({
  port: parseInt(process.env.PORT, 10),
  controllers: [new Test()],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
