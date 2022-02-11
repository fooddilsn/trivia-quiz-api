import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ServiceMetadata, ServerConfig } from './config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const serviceMetadata = configService.get<ServiceMetadata>('service');
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Trivia Quiz API')
    .setDescription('A hopefully awesome RESTful API service for creating trivia quizzes.')
    .setVersion(serviceMetadata.version)
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('swagger', app, swaggerDocument, {
    customSiteTitle: 'Trivia Quiz API',
  });

  app.enableShutdownHooks();

  const serverConfig = configService.get<ServerConfig>('server');
  await app.listen(serverConfig.port, serverConfig.host);
}

bootstrap();
