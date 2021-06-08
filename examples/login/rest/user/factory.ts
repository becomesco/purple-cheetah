import type { User, UserProtected } from './models';
import { JWTPermissionName, JWTRoleName } from '../../../../src/types';

export interface UserFactory {
  create(config: {
    admin: boolean;
    name?: { first: string; last: string };
    email?: string;
  }): User;
  toProtected(user: User): UserProtected;
}

const userFactory: UserFactory = {
  create(config) {
    return {
      _id: '',
      roles: [
        {
          name: config.admin ? JWTRoleName.ADMIN : JWTRoleName.USER,
          permissions: [
            {
              name: JWTPermissionName.READ,
            },
            {
              name: JWTPermissionName.WRITE,
            },
            {
              name: JWTPermissionName.DELETE,
            },
            {
              name: JWTPermissionName.EXECUTE,
            },
          ],
        },
      ],
      email: config.email ? config.email : '',
      createdAt: 0,
      username: config.name ? `${config.name.first} ${config.name.last}` : '',
      updatedAt: 0,
      personal: {
        firstName: config.name ? config.name.first : '',
        lastName: config.name ? config.name.last : '',
      },
      password: '',
    };
  },
  toProtected(user) {
    return {
      _id: user._id,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt,
      personal: user.personal,
      roles: user.roles,
      email: user.email,
      username: user.username,
    };
  },
};

export function useUserFactory() {
  return userFactory;
}
