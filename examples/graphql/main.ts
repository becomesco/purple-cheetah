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
      rootName: 'Test',
      graphiql: true,
      collections: [TodoCollection],
    }),
  ],
});
