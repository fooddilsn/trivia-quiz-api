import { User } from './schemas';

export const omitUserPassword = (user: User): User => {
  const { password, ...rest } = user;

  return rest as User;
};
