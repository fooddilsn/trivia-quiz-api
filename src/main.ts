import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/mongoose';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as rTracer from 'cls-rtracer';
import { Connection } from 'mongoose';
import * as migrateMongo from 'migrate-mongo';
import { ServiceMetadata, ServerConfig, MongoDBConfig } from './config';
import { Paginated } from './common/dto';
import { Exception } from './common/exceptions';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const mongodbConfig = configService.get<MongoDBConfig>('mongodb');
  const connection = app.get<Connection>(getConnectionToken());

  migrateMongo.config.set(mongodbConfig.migrations);

  await migrateMongo.up(connection.db, connection.getClient());

  const serviceMetadata = configService.get<ServiceMetadata>('service');
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Trivia Quiz API')
    .setDescription('A RESTful API service for creating trivia quizzes.')
    .setVersion(serviceMetadata.version)
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [Paginated, Exception],
  });

  SwaggerModule.setup('swagger', app, swaggerDocument, {
    customSiteTitle: 'Trivia Quiz API',
  });

  app.use(rTracer.expressMiddleware());

  app.enableShutdownHooks();

  const serverConfig = configService.get<ServerConfig>('server');
  await app.listen(serverConfig.port, serverConfig.host);
}

bootstrap();
