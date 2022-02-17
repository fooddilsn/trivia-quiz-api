import { ApiHideProperty } from '@nestjs/swagger';

export class Paginated<T> {
  @ApiHideProperty()
  data: T[];

  page: number;
  size: number;
  pages: number;
  total: number;
}
