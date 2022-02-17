import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { QueryOptions } from 'mongoose';
import { toMongoQueryPagination } from '../utils';

export class PaginatedQuery {
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @ApiPropertyOptional()
  page: number = 1;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  @ApiPropertyOptional()
  size: number = 100;

  toMongoQueryPagination(): QueryOptions {
    return toMongoQueryPagination(this.page, this.size);
  }
}
