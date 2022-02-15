import { Chance } from 'chance';
import * as RandExp from 'randexp';
import { User } from '../schemas';
import { UserPayload } from '../dto';

const chance = new Chance();

const user = {
  firstName: (): string => chance.first(),
  lastName: (): string => chance.last(),
  email: (): string => chance.email({ domain: 'test.com' }),
  password: (): string => new RandExp(/^[a-z]{3}[A-Z]{3}[@$!%?&*.][0-9]$/).gen(),
};

export const mockUser = (): Omit<User, 'id' | 'fullName' | 'createdAt' | 'updatedAt'> => ({
  firstName: user.firstName(),
  lastName: user.lastName(),
  email: user.email(),
  password: user.password(),
});

export const mockUserPayload = (email?: string): UserPayload => ({
  firstName: user.firstName(),
  lastName: user.lastName(),
  email: email || user.email(),
  password: user.password(),
});
