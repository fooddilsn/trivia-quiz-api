import * as mongoose from 'mongoose';

export const random = {
  id: (): string => new mongoose.Types.ObjectId().toHexString(),
};
