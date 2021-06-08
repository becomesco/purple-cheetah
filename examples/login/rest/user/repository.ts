import { createFSDBRepository } from '../../../../src';
import { User, UserSchema } from './models';

export const UserRepo = createFSDBRepository<
  User,
  {
    findByEmail(email: string): Promise<User | null>;
  }
>({
  name: 'User repository',
  schema: UserSchema,
  collection: 'login_users',
  methods({ repo }) {
    return {
      async findByEmail(email) {
        return repo.findBy((e) => e.email === email);
      },
    };
  },
});
