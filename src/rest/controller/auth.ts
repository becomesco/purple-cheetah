import * as crypto from 'crypto';
import {
  Controller,
  FSDBEntity,
  FSDBRepository,
  HTTPError,
  HTTPStatus,
  JWTError,
  JWTRole,
  Logger,
  MongoDBEntity,
  MongoDBRepository,
} from '../../types';
import { createController, createControllerMethod } from './main';
import { compare as bcryptCompare } from 'bcrypt';
import { useJwt, useJwtEncoding } from '../../security';

interface EntityRequiredProps {
  password: string;
  roles: JWTRole[];
}

export function createAuthController<
  FSDB_Entity extends FSDBEntity & EntityRequiredProps,
  MongoDB_Entity extends MongoDBEntity & EntityRequiredProps,
  Methods extends {
    findByEmail(email: string): Promise<FSDB_Entity | MongoDB_Entity>;
  },
>(config: {
  baseUri?: string;
  jwt: {
    scope: string;
    refreshTokenTTL: number;
    addUserPropsToJwt?: string[];
  };
  userRepository:
    | FSDBRepository<FSDBEntity, Methods>
    | MongoDBRepository<MongoDBEntity, Methods>;
}): Controller {
  const refreshTokens: {
    [userId: string]: {
      [value: string]: number;
    };
  } = {};

  function createAccessToken(
    user: MongoDB_Entity | FSDB_Entity,
    errorHandler: HTTPError,
  ): string {
    const JWT = useJwt();
    const props: {
      [key: string]: unknown;
    } = {};
    if (config.jwt.addUserPropsToJwt) {
      for (let i = 0; i < config.jwt.addUserPropsToJwt.length; i++) {
        const propName = config.jwt.addUserPropsToJwt[i];
        if (
          propName !== 'password' &&
          propName !== 'pass' &&
          user[propName as never]
        ) {
          props[propName] = user[propName as never];
        }
      }
    }
    const accessToken = JWT.create({
      issuer: config.jwt.scope,
      userId: `${user._id}`,
      roles: user.roles,
      props,
    });
    if (accessToken instanceof JWTError) {
      throw errorHandler.occurred(
        HTTPStatus.INTERNAL_SERVER_ERROR,
        'Failed to create a JWT.',
      );
    }
    const JWTEncoder = useJwtEncoding();
    return JWTEncoder.encode(accessToken);
  }
  async function getRefreshTokenData(
    errorHandler: HTTPError,
    logger: Logger,
    authorization: string,
    name: string,
  ): Promise<{
    user: MongoDB_Entity | FSDB_Entity;
    auth: {
      userId: string;
      refreshToken: string;
    };
  }> {
    if (!authorization) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        'Missing authorization header.',
      );
    }
    const auth = {
      userId: '',
      refreshToken: '',
    };
    let authParts: string[];
    try {
      authParts = Buffer.from(authorization.replace('Basic ', ''), 'base64')
        .toString()
        .split(':');
    } catch (e) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        'Invalid authorization header format',
      );
    }
    if (authParts.length !== 2) {
      throw errorHandler.occurred(
        HTTPStatus.FORBIDDEN,
        'Invalid authorization header format.',
      );
    }
    auth.userId = authParts[0];
    auth.refreshToken = authParts[1];
    if (!refreshTokens[auth.userId]) {
      logger.warn(name, 'Invalid user ID');
      throw errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        'Invalid user ID and/or refresh token',
      );
    }
    const refreshToken = refreshTokens[auth.userId][auth.refreshToken];
    if (!refreshToken) {
      logger.warn(name, 'Invalid refresh token');
      throw errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        'Invalid user ID and/or refresh token',
      );
    }
    if (refreshToken < Date.now()) {
      delete refreshTokens[auth.userId][auth.refreshToken];
      logger.warn(name, 'Refresh token expired');
      throw errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        'Invalid user ID and/or refresh token',
      );
    }
    const user = await config.userRepository.findById(auth.userId);
    if (!user) {
      logger.warn(name, 'User does not exist in the database.');
      throw errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        'Invalid user ID and/or refresh token',
      );
    }
    return { user: user as MongoDB_Entity | FSDB_Entity, auth };
  }

  return createController({
    name: 'Auth',
    path: config.baseUri ? config.baseUri : '',
    methods: [
      createControllerMethod({
        path: '/login',
        name: 'login',
        type: 'post',
        async handler({ request, errorHandler, logger, name }): Promise<{
          accessToken: string;
          refreshToken: string;
        }> {
          const authorization = request.headers.authorization;
          if (!authorization) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              'Missing authorization header.',
            );
          }
          const auth = {
            email: '',
            password: '',
          };
          let authParts: string[];
          try {
            authParts = Buffer.from(
              authorization.replace('Basic ', ''),
              'base64',
            )
              .toString()
              .split(':');
          } catch (e) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              'Invalid authorization header format',
            );
          }
          if (authParts.length !== 2) {
            throw errorHandler.occurred(
              HTTPStatus.FORBIDDEN,
              'Invalid authorization header format.',
            );
          }
          auth.email = authParts[0];
          auth.password = authParts[1];
          const user = await config.userRepository.methods.findByEmail(
            auth.email,
          );
          if (!user) {
            logger.warn(name, 'Bad email.');
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              'Invalid email and/or password.',
            );
          }
          const checkPassword = await bcryptCompare(
            auth.password,
            user.password,
          );
          if (!checkPassword) {
            logger.warn(name, 'Bad password');
            throw errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              'Invalid email and/or password.',
            );
          }
          const refreshToken = {
            value: crypto
              .createHash('sha512')
              .update(crypto.randomBytes(64).toString() + Date.now())
              .digest('hex'),
            expAt: Date.now() + config.jwt.refreshTokenTTL,
          };
          if (!refreshTokens[`${user._id}`]) {
            refreshTokens[`${user._id}`] = {};
          }
          refreshTokens[`${user._id}`][refreshToken.value] = refreshToken.expAt;
          return {
            accessToken: createAccessToken(user, errorHandler),
            refreshToken: refreshToken.value,
          };
        },
      }),
      createControllerMethod({
        path: '/refresh-access',
        name: 'refreshAccess',
        type: 'post',
        async handler({
          request,
          errorHandler,
          logger,
          name,
        }): Promise<{ accessToken: string }> {
          const data = await getRefreshTokenData(
            errorHandler,
            logger,
            request.headers.authorization as string,
            name,
          );
          return {
            accessToken: createAccessToken(data.user, errorHandler),
          };
        },
      }),
      createControllerMethod({
        path: '/logout',
        name: 'logout',
        type: 'post',
        async handler({
          request,
          errorHandler,
          logger,
          name,
        }): Promise<{ status: string }> {
          const data = await getRefreshTokenData(
            errorHandler,
            logger,
            request.headers.authorization as string,
            name,
          );
          delete refreshTokens[data.auth.userId][data.auth.refreshToken];
          return {
            status: 'ok',
          };
        },
      }),
    ],
  });
}
