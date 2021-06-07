import { createGraphqlCollection } from '../collection';
import {
  createGraphqlAuthAccessRefreshTokensObject,
  createGraphqlAuthAccessTokenObject,
} from './_objects';
import {
  FSDBEntity,
  GraphqlCollection,
  JWTRole,
  MongoDBEntity,
  FSDBRepository,
  GraphqlResolverType,
  HTTPError,
  HTTPStatus,
  JWTError,
  Logger,
  MongoDBRepository,
} from '../../../types';
import { useJwt, useJwtEncoding } from '../../../modules';
import { createGraphqlResolver } from '../resolver';
import { compare as bcryptCompare } from 'bcrypt';
import * as crypto from 'crypto';

interface EntityRequiredProps {
  password: string;
  roles: JWTRole[];
}

export function createGraphqlAuthCollection<
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
}): GraphqlCollection {
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
    name: string,
    userId: string,
    refreshTokenValue: string,
  ): Promise<{
    user: MongoDB_Entity | FSDB_Entity;
  }> {
    if (!refreshTokens[userId]) {
      logger.warn(name, 'Invalid user ID');
      throw errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        'Invalid user ID and/or refresh token',
      );
    }
    const refreshToken = refreshTokens[userId][refreshTokenValue];
    if (!refreshToken) {
      logger.warn(name, 'Invalid refresh token');
      throw errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        'Invalid user ID and/or refresh token',
      );
    }
    if (refreshToken < Date.now()) {
      delete refreshTokens[userId][refreshTokenValue];
      logger.warn(name, 'Refresh token expired');
      throw errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        'Invalid user ID and/or refresh token',
      );
    }
    const user = await config.userRepository.findById(userId);
    if (!user) {
      logger.warn(name, 'User does not exist in the database.');
      throw errorHandler.occurred(
        HTTPStatus.UNAUTHORIZED,
        'Invalid user ID and/or refresh token',
      );
    }
    return { user: user as MongoDB_Entity | FSDB_Entity };
  }

  return createGraphqlCollection({
    name: 'auth',
    objects: [
      createGraphqlAuthAccessTokenObject(),
      createGraphqlAuthAccessRefreshTokensObject(),
    ],
    resolvers: [
      createGraphqlResolver<
        { accessToken: string; refreshToken: string },
        {
          email: string;
          password: string;
        }
      >({
        name: 'login',
        type: GraphqlResolverType.MUTATION,
        return: {
          type: 'AuthAccessRefreshTokens',
        },
        args: {
          email: 'String!',
          password: 'String!',
        },
        async resolve({
          email,
          password,
          __logger,
          __errorHandler,
          __resolverName,
        }) {
          const user = await config.userRepository.methods.findByEmail(email);
          if (!user) {
            __logger.warn(__resolverName, 'Bad email.');
            throw __errorHandler.occurred(
              HTTPStatus.UNAUTHORIZED,
              'Invalid email and/or password.',
            );
          }
          const checkPassword = await bcryptCompare(password, user.password);
          if (!checkPassword) {
            __logger.warn(__resolverName, 'Bad password');
            throw __errorHandler.occurred(
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
            accessToken: createAccessToken(user, __errorHandler),
            refreshToken: refreshToken.value,
          };
        },
      }),
      createGraphqlResolver<
        { accessToken: string },
        { userId: string; refreshToken: string }
      >({
        name: 'refreshAccess',
        type: GraphqlResolverType.MUTATION,
        return: {
          type: 'AuthAccessToken',
        },
        args: {
          userId: 'String!',
          refreshToken: 'String!',
        },
        async resolve({
          userId,
          refreshToken,
          __resolverName,
          __errorHandler,
          __logger,
        }) {
          const data = await getRefreshTokenData(
            __errorHandler,
            __logger,
            __resolverName,
            userId,
            refreshToken,
          );
          return {
            accessToken: createAccessToken(data.user, __errorHandler),
          };
        },
      }),
      createGraphqlResolver<string, { userId: string; refreshToken: string }>({
        name: 'logout',
        type: GraphqlResolverType.MUTATION,
        return: {
          type: 'String',
        },
        args: {
          userId: 'String!',
          refreshToken: 'String!',
        },
        async resolve({
          userId,
          refreshToken,
          __resolverName,
          __errorHandler,
          __logger,
        }) {
          await getRefreshTokenData(
            __errorHandler,
            __logger,
            __resolverName,
            userId,
            refreshToken,
          );
          delete refreshTokens[userId][refreshToken];
          return 'ok';
        },
      }),
    ],
  });
}
