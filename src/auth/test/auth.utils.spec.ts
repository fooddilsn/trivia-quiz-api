import { hashPassword, verifyPassword } from '../auth.utils';

describe('Auth utils', () => {
  describe('hashPassword(password) / verifyPassword(password, hash)', () => {
    it('should hash the password and then verify it successfully when it receives the correct password', () => {
      const password = 'secret';
      const hash = hashPassword(password);

      expect(verifyPassword(password, hash)).toBe(true);
    });

    it('should hash the password and then fail verification when it receives an incorrect password', () => {
      const hash = hashPassword('secret');

      expect(verifyPassword('wrong.password', hash)).toBe(false);
    });
  });
});
