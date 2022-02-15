import { randomBytes, pbkdf2Sync } from 'crypto';

const SALT_BYTES = 16;

export const hashPassword = (password: string): string => {
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const derivedKey = pbkdf2Sync(password, salt, 100000, 64, 'sha512');

  return `${salt}${derivedKey.toString('hex')}`;
};

export const verifyPassword = (password: string, hash: string): boolean => {
  const salt = hash.substring(0, SALT_BYTES * 2);
  const key = hash.substring(SALT_BYTES * 2);

  return key === pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
};
