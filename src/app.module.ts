import { APP_PIPE } from '@nestjs/core';
import { Module, NestModule, MiddlewareConsumer, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import config, { envSchema, Config, MongoDBConfig } from './config';
import { LoggerMiddleware } from './common/middleware';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './health/health.module';
import { QuizzesModule } from './quizzes/quizzes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
      validationSchema: envSchema,
    }),
    LoggerModule,
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService<Config>) =>
        configService.get<MongoDBConfig>('mongodb'),
      inject: [ConfigService],
    }),
    HealthModule,
    QuizzesModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: (): ValidationPipe =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
