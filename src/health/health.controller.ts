import { Controller, Get, UseFilters } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
  MongooseHealthIndicator,
} from '@nestjs/terminus';
import { HealthCheckExceptionFilter } from './filters';

@ApiTags('healthz')
@Controller('healthz')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly mongoose: MongooseHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @UseFilters(HealthCheckExceptionFilter)
  @ApiOperation({ summary: 'Health check' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([
      (): Promise<HealthIndicatorResult> => this.mongoose.pingCheck('mongodb'),
    ]);
  }
}
