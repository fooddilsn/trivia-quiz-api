import * as mongoose from 'mongoose';
import { normalizeMongoDocument, toMongoQueryPagination } from '../mongo.utils';

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

  describe('toMongoQueryPagination(page, size)', () => {
    it('should return a QueryOptions object with limit and skip', () => {
      expect(toMongoQueryPagination(1, 10)).toEqual({
        limit: 10,
        skip: 0,
      });
      expect(toMongoQueryPagination(3, 50)).toEqual({
        limit: 50,
        skip: 100,
      });
    });
  });
});
