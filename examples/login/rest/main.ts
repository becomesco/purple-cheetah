import { createFSDB, createPurpleCheetah } from '../../../src';

createPurpleCheetah({
  port: 1280,
  modules: [
    createFSDB({
      output: __dirname,
    }),
  ],
});
