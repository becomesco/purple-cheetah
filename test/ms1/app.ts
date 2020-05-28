import {
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
  MiracleConnect,
  EnableGraphQL,
} from '../../src';
import { Test } from './controller';
import { QLTest } from './graphql/gql';

@EnableGraphQL({
  graphiql: true,
  rootName: 'MS1',
  uri: '/gql',
  entries: [new QLTest()],
})
@MiracleConnect({
  keyStore: {
    origin: 'http://localhost:1280',
    auth: {
      key: '2',
      secret: 'ms1',
    },
  },
  registry: {
    origin: 'http://localhost:1281',
    service: {
      name: 'ms1',
      origin: `http://localhost:${process.env.PORT}`,
      ssl: false,
    },
  },
})
@Application({
  port: parseInt(process.env.PORT, 10),
  controllers: [new Test()],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
