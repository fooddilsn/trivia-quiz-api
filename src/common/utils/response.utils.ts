import { Paginated } from '../dto';

export const toPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  size: number
): Paginated<T> => ({
  data,
  page,
  size: size > data.length ? data.length : size,
  pages: Math.ceil(total / size) || 1,
  total,
});
