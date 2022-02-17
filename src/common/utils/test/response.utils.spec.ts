import { toPaginatedResponse } from '../response.utils';

describe('Response utils', () => {
  describe('toPaginatedResponse(data, total, page, size)', () => {
    it('should return a PaginatedResponse', () => {
      const data = [0, 1, 1, 2, 3, 5, 8, 13, 21];

      expect(toPaginatedResponse(data, data.length, 1, 5)).toEqual({
        data,
        page: 1,
        size: 5,
        pages: 2,
        total: data.length,
      });
      expect(toPaginatedResponse(data, data.length, 1, 10)).toEqual({
        data,
        page: 1,
        size: 9,
        pages: 1,
        total: data.length,
      });
    });
  });
});
