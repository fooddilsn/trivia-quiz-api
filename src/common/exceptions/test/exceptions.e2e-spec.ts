import { Test } from '@nestjs/testing';
import { APP_FILTER } from '@nestjs/core';
import {
  INestApplication,
  HttpStatus,
  HttpException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createMock } from '@golevelup/ts-jest';
import * as request from 'supertest';
import config, { envSchema } from '../../../config';
import { LoggerModule } from '../../../logger/logger.module';
import { Exception } from '../exception';
import { ExceptionsFilter } from '../exceptions.filter';
import { ExceptionsModule, ExceptionsService } from './exceptions.module';

describe('Exceptions (e2e)', () => {
  let app: INestApplication;

  const exceptionsService = createMock<ExceptionsService>({
    getException: jest.fn().mockImplementation(() => 'Hello exceptions world!'),
  });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: 'env/.env.test',
          load: [config],
          validationSchema: envSchema,
        }),
        LoggerModule,
        ExceptionsModule,
      ],
      providers: [
        {
          provide: APP_FILTER,
          useClass: ExceptionsFilter,
        },
      ],
    })
      .overrideProvider(ExceptionsService)
      .useValue(exceptionsService)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws an Exception
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new Exception(
        {
          code: 'EX.001',
          message: 'Exception',
        },
        HttpStatus.BAD_REQUEST
      );
    });

    await request(app.getHttpServer()).get('/exceptions').expect(400).expect({
      code: 'EX.001',
      message: 'Exception',
    });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws a NotFoundException
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new NotFoundException();
    });

    await request(app.getHttpServer()).get('/exceptions').expect(404).expect({
      code: 'HTTP.404',
      message: 'Not Found',
    });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws a NotFoundException with a custom error message
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new NotFoundException('Resource not found');
    });

    await request(app.getHttpServer()).get('/exceptions').expect(404).expect({
      code: 'HTTP.404',
      message: 'Resource not found',
    });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws a ForbiddenException with a custom error object
      THEN strips the unknown properties AND returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new ForbiddenException({
        note: 'You cannot access to this resource',
      });
    });

    await request(app.getHttpServer()).get('/exceptions').expect(403).expect({
      code: 'HTTP.403',
      message: 'Forbidden',
    });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws a BadRequestException with an array of errors
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new BadRequestException(['invalid email', 'invalid password']);
    });

    await request(app.getHttpServer())
      .get('/exceptions')
      .expect(400)
      .expect({
        code: 'HTTP.400',
        message: 'Bad Request',
        details: ['invalid email', 'invalid password'],
      });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws a BadRequestException with an array of errors and a custom error message
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new BadRequestException(
        ['invalid username', 'invalid password'],
        'Invalid credentials'
      );
    });

    await request(app.getHttpServer())
      .get('/exceptions')
      .expect(400)
      .expect({
        code: 'HTTP.400',
        message: 'Invalid credentials',
        details: ['invalid username', 'invalid password'],
      });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws a BadGatewayException with a number
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new BadGatewayException(42);
    });

    await request(app.getHttpServer()).get('/exceptions').expect(502).expect({
      code: 'HTTP.502',
      message: 42,
    });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws an HttpException with a custom error message
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new HttpException(
        'An error occurred while processing the request',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    });

    await request(app.getHttpServer()).get('/exceptions').expect(500).expect({
      code: 'HTTP.500',
      message: 'An error occurred while processing the request',
    });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws an HttpException with a custom error object
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new HttpException(
        {
          code: 'HTTP.001',
          message: 'Http exception',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    });

    await request(app.getHttpServer()).get('/exceptions').expect(500).expect({
      code: 'HTTP.001',
      message: 'Http exception',
    });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws an HttpException with a custom error message
      THEN strips the unknown properties AND returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new HttpException({ note: 'unknown property' }, HttpStatus.FORBIDDEN);
    });

    await request(app.getHttpServer()).get('/exceptions').expect(403).expect({
      code: 'HTTP.403',
      message: 'Forbidden',
    });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws an HttpException with an array of errors
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new HttpException(['invalid email', 'invalid password'], HttpStatus.BAD_REQUEST);
    });

    await request(app.getHttpServer())
      .get('/exceptions')
      .expect(400)
      .expect({
        code: 'HTTP.400',
        message: 'Bad Request',
        details: ['invalid email', 'invalid password'],
      });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws an HttpException with an unknown status code
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new HttpException(['Invalid SSL Certificate'], 526);
    });

    await request(app.getHttpServer())
      .get('/exceptions')
      .expect(526)
      .expect({
        code: 'HTTP.526',
        message: 'Unknown error',
        details: ['Invalid SSL Certificate'],
      });
  });

  it(`GIVEN the ExceptionsFilter WHEN the application throws a runtime Error
      THEN returns an HTTP response representing the exception`, async () => {
    exceptionsService.getException.mockImplementationOnce(() => {
      throw new Error('Boom!');
    });

    await request(app.getHttpServer()).get('/exceptions').expect(500).expect({
      code: 'HTTP.500',
      message: 'Internal Server Error',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
