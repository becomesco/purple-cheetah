import {
  PurpleCheetah,
  Application,
  BodyParserMiddleware,
  CORSMiddleware,
  EnableGraphQL,
} from '../../../src';
import { HelloWorldController } from './hello-world/controller';
import { HelloWorldQL } from './graphql/hello-world/main';

@EnableGraphQL({
  graphiql: true,
  rootName: 'PurpleCheetah',
  uri: '/graphql',
  entries: [new HelloWorldQL()],
})
@Application({
  port: parseInt(process.env.PORT, 10),
  controllers: [new HelloWorldController()],
  middleware: [new BodyParserMiddleware(), new CORSMiddleware()],
})
export class App extends PurpleCheetah {}
