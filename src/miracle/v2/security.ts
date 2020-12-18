import Axios from 'axios';
import { JWT, JWTEncoding } from '../../security';
import { ControllerMethodPreRequestHandler } from '../../decorators';
import { Logger } from '../../logging';
import { HttpErrorFactory } from '../../factories';
import { HttpStatus } from '../../interfaces';
import {
  MiracleJWTCustomPool,
  MiracleV2ServiceIncomingPolicy,
  MiracleV2ServiceIncomingPolicySchema,
} from './types';
import { ObjectUtility } from '../../util';
import { MiracleV2 } from './miracle';

export class MiracleV2Security {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static token?: JWT<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static setToken(token?: JWT<any>) {
    this.token = token;
  }
  static preRequestHandler<T extends MiracleJWTCustomPool>(): ControllerMethodPreRequestHandler<JWT<T>> {
    const logger = new Logger('MiracleV2Security');
    const error = HttpErrorFactory.instance('preRequestHandler', logger);
    return async (request) => {
      if (!this.token) {
        if ((await MiracleV2.auth()) === false) {
          error.occurred(
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Failed to register.',
          );
        }
      }
      if (!request.headers.authorization) {
        throw error.occurred(
          HttpStatus.BAD_REQUEST,
          'Missing authorization header.',
        );
      }
      const jwt = JWTEncoding.decode<T>(request.headers.authorization);
      if (jwt instanceof Error) {
        throw error.occurred(HttpStatus.BAD_REQUEST, jwt.message);
      }
      if (!jwt.payload.customPool || !jwt.payload.customPool.incomingPolicy) {
        throw error.occurred(HttpStatus.BAD_REQUEST, 'Missing important data.');
      }
      try {
        ObjectUtility.compareWithSchema(
          jwt.payload.customPool,
          {
            incomingPolicy: {
              __type: 'array',
              __required: true,
              __child: {
                __type: 'object',
                __content: MiracleV2ServiceIncomingPolicySchema,
              },
            },
          },
          'jwt.payload.customPool',
        );
      } catch (e) {
        throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
      }
      const incomingPolicy: MiracleV2ServiceIncomingPolicy[] = this.token
        .payload.customPool.incomingPolicy;
      let allowed = false;
      for (const i in incomingPolicy) {
        if (
          incomingPolicy[i].path === request.originalUrl &&
          incomingPolicy[i].from.includes(jwt.payload.userId)
        ) {
          allowed = true;
          break;
        }
      }
      if (!allowed) {
        logger.warn(
          'preRequestHandler',
          `Service "${jwt.payload.userId}" is not allowed to call "${request.originalUrl}"`,
        );
        throw error.occurred(HttpStatus.UNAUTHORIZED, '');
      }
      try {
        await Axios({
          url: `${MiracleV2.registryOrigin()}/miracle/auth/check`,
          method: 'POST',
          headers: {
            Authorization: request.headers.authorization,
          },
        });
      } catch (e) {
        logger.error('preRequestHandler', {
          msg: e.message,
          err: e.error ? e.error.response : undefined,
        });
        logger.warn('preRequestHandler', `Invalid token`);
        throw error.occurred(HttpStatus.UNAUTHORIZED, '');
      }
      return jwt;
    };
  }
}
