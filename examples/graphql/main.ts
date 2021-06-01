import {
  createFSDB,
  createGraphql,
  createPurpleCheetah,
} from '../../src';
import { TodoCollection } from './todo';

createPurpleCheetah({
  port: 1280,
  modules: [
    createFSDB({}),
    createGraphql({
      rootName: 'ExampleGraphQL',
      graphiql: true,
      collections: [TodoCollection],
    }),
  ],
});
