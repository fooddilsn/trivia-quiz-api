import { QueryOptions } from 'mongoose';

export const normalizeMongoDocument = (doc: any, ret: any): Record<string, unknown> => {
  const { _id, __v, ...rest } = ret;

  return {
    id: _id.toHexString(),
    ...rest,
  };
};

export const toMongoQueryPagination = (page: number, size: number): QueryOptions => ({
  limit: size,
  skip: size * (page - 1),
});
