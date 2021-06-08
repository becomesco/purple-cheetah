import {
  createBodyValidationPreRequestHandler,
  createController,
  createControllerMethod,
  createJwtProtectionPreRequestHandler,
} from '../../../../src';
import {
  BodyValidationPreRequestHandlerResult,
  HTTPStatus,
  JWTPermissionName,
  JWTPreRequestHandlerResult,
  JWTRoleName,
} from '../../../../src/types';
import {
  UserJWTProps,
  UserProtected,
  UserSignUpData,
  UserSignUpDataSchema,
} from './models';
import { UserRepo } from './repository';
import { UserFactory, useUserFactory } from './factory';

export const UserController = createController<{ userFactory: UserFactory }>({
  name: 'User controller',
  path: '/user',
  setup() {
    return {
      userFactory: useUserFactory(),
    };
  },
  methods({ userFactory }) {
    return {
      getAll: createControllerMethod<
        JWTPreRequestHandlerResult<UserJWTProps>,
        { users: UserProtected[] }
      >({
        path: '/all',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.USER, JWTRoleName.ADMIN],
          JWTPermissionName.READ,
        ),
        async handler() {
          return {
            users: (await UserRepo.findAll()).map((e) =>
              userFactory.toProtected(e),
            ),
          };
        },
      }),
      getByAccessToken: createControllerMethod<
        JWTPreRequestHandlerResult<UserJWTProps>,
        { user: UserProtected }
      >({
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.USER, JWTRoleName.ADMIN],
          JWTPermissionName.READ,
        ),
        async handler({ accessToken, errorHandler }) {
          const user = await UserRepo.findById(accessToken.payload.userId);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.INTERNAL_SERVER_ERROR,
              'Failed to find a user using access token.',
            );
          }
          return {
            user: userFactory.toProtected(user),
          };
        },
      }),
      getById: createControllerMethod<
        JWTPreRequestHandlerResult<UserJWTProps>,
        { user: UserProtected }
      >({
        path: '/:id',
        type: 'get',
        preRequestHandler: createJwtProtectionPreRequestHandler(
          [JWTRoleName.USER, JWTRoleName.ADMIN],
          JWTPermissionName.READ,
        ),
        async handler({ request, errorHandler }) {
          const user = await UserRepo.findById(request.params.id);
          if (!user) {
            throw errorHandler.occurred(
              HTTPStatus.NOT_FOUNT,
              `User with ID "${request.params.id}" does not exist.`,
            );
          }
          return { user: userFactory.toProtected(user) };
        },
      }),
      signUp: createControllerMethod<
        BodyValidationPreRequestHandlerResult<UserSignUpData>,
        { ok: boolean }
      >({
        path: '/sign-up',
        type: 'post',
        preRequestHandler:
          createBodyValidationPreRequestHandler(UserSignUpDataSchema),
        async handler() {
          return {
            ok: true,
          };
        },
      }),
    };
  },
});
