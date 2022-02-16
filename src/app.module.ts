import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { Module, NestModule, MiddlewareConsumer, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import config, { envSchema, Config, MongoDBConfig } from './config';
import { LoggerMiddleware } from './common/middleware';
import { ExceptionsFilter } from './common/exceptions';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
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
      useFactory: async (configService: ConfigService<Config>) => {
        const { migrations, ...mongooseConfig } = configService.get<MongoDBConfig>('mongodb');
        return mongooseConfig;
      },
      inject: [ConfigService],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
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
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
