import { random } from '../../common/test';
import { omitUserPassword } from '../users.utils';

describe('Users utils', () => {
  describe('omitUserPassword(user)', () => {
    it('should return the user without the password', () => {
      const user = {
        id: random.id(),
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        email: 'john.doe@test.com',
        password: 'secret',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const { password, ...rest } = user;

      expect(omitUserPassword(user)).toEqual(rest);
    });
  });
});
