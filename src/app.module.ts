import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config, { envSchema } from './config';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: envSchema,
    }),
    HealthModule,
  ],
})
export class AppModule {}
