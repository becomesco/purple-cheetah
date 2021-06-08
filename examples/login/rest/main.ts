import { createFSDB, createJwt, createPurpleCheetah } from '../../../src';
import { JWTAlgorithm } from '../../../src/types';

createPurpleCheetah({
  port: 1280,
  modules: [
    createFSDB({
      output: __dirname,
    }),
    createJwt({
      scopes: [
        {
          alg: JWTAlgorithm.HMACSHA256,
          expIn: 300000,
          issuer: 'localhost',
          secret: 'secret',
        },
      ],
    }),
  ],
});
