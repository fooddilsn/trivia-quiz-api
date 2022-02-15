import { randomBytes, pbkdf2Sync } from 'crypto';

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = pbkdf2Sync(password, salt, 100000, 64, 'sha512');

  return `${salt}${derivedKey.toString('hex')}`;
};
