import * as mongoose from 'mongoose';
import { Chance } from 'chance';

const chance = new Chance();

export const random = {
  id: (): string => new mongoose.Types.ObjectId().toHexString(),
  email: (): string => chance.email({ domain: 'test.com' }),
};
