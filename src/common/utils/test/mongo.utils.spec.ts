import * as mongoose from 'mongoose';
import { normalizeMongoDocument } from '../mongo.utils';

describe('MongoDB utils', () => {
  describe('normalizeMongoDocument(doc, ret)', () => {
    it('should return a normalized MongoDB document', () => {
      const doc = {
        _id: new mongoose.Types.ObjectId('62094841917533fd9f3a3805'),
        name: 'John Doe',
        role: 'Software Engineer',
        __v: 0,
      };
      const ret = doc;

      expect(normalizeMongoDocument(doc, ret)).toEqual({
        id: '62094841917533fd9f3a3805',
        name: 'John Doe',
        role: 'Software Engineer',
      });
    });
  });
});
