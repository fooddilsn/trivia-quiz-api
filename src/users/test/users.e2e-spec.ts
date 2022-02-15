import { Test } from '@nestjs/testing';
import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'supertest';
import config, { envSchema, Config, MongoDBConfig } from '../../config';
import { ExceptionsFilter } from '../../common/exceptions';
import { random } from '../../common/utils';
import { LoggerModule } from '../../logger/logger.module';
import { UsersModule } from '../users.module';
import { UserDocument, User } from '../schemas';
import { mockUser, mockUserPayload } from './users.mocks';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let UserModel: Model<UserDocument>;

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
        MongooseModule.forRootAsync({
          useFactory: async (configService: ConfigService<Config>) =>
            configService.get<MongoDBConfig>('mongodb'),
          inject: [ConfigService],
        }),
        UsersModule,
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
    }).compile();

    app = moduleRef.createNestApplication();
    UserModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));

    await app.init();
  });

  describe('POST /users', () => {
    it(`GIVEN a user who wants to create a user
        WHEN the request is well-formed THEN returns the new user`, async () => {
      const payload = mockUserPayload();

      const response = await request(app.getHttpServer()).post('/users').send(payload).expect(201);

      expect(response.body).toEqual({
        id: expect.stringMatching(/^[a-f0-9]{24}$/),
        ...payload,
        fullName: `${payload.firstName} ${payload.lastName}`,
        password: undefined,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it(`GIVEN a user who wants to create a user
        WHEN the request has not a well-formed payload THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ invalid: true })
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details.length).toBe(7);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          'firstName must be a string',
          'firstName should not be empty',
          'lastName must be a string',
          'lastName should not be empty',
          'email must be an email',
          'password must contain at least 8 characters including a lower-case letter, an upper-case letter, a number, and a special character (@$!%?&*.)',
          'property invalid should not exist',
        ])
      );
    });

    it(`GIVEN a user who wants to create a user
        WHEN the request is well-formed BUT another user is registered with the same email
        THEN returns the USER.001 exception code`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      const payload = mockUserPayload(user.email);

      const response = await request(app.getHttpServer()).post('/users').send(payload).expect(400);

      expect(response.body.code).toBe('USER.001');
    });
  });

  describe('PUT /users/:userId', () => {
    it(`GIVEN a user who wants to update a user
        WHEN the request is well-formed THEN returns the updated user`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      const payload = mockUserPayload(user.email);

      const response = await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .send(payload)
        .expect(200);

      expect(response.body).toEqual({
        ...user.toJSON(),
        ...payload,
        fullName: `${payload.firstName} ${payload.lastName}`,
        password: undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: expect.not.stringMatching(user.createdAt.toISOString()),
      });
    });

    it(`GIVEN a user who wants to update a user
        WHEN the request has not a well-formed user id THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockUserPayload();

      const response = await request(app.getHttpServer())
        .put('/users/invalid')
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual(['userId must be a mongodb id']);
    });

    it(`GIVEN a user who wants to update a user
        WHEN the request has not a well-formed payload THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${random.id()}`)
        .send({ invalid: true })
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details.length).toBe(7);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          'firstName must be a string',
          'firstName should not be empty',
          'lastName must be a string',
          'lastName should not be empty',
          'email must be an email',
          'password must contain at least 8 characters including a lower-case letter, an upper-case letter, a number, and a special character (@$!%?&*.)',
          'property invalid should not exist',
        ])
      );
    });

    it(`GIVEN a user who wants to update a user
        WHEN the request is well-formed BUT another user is registered with the same email
        THEN returns the USER.001 exception code`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      const payload = mockUserPayload(user.email);

      const response = await request(app.getHttpServer())
        .put(`/users/${random.id()}`)
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('USER.001');
    });

    it(`GIVEN a user who wants to update a quiz
        WHEN the request is well-formed BUT the user does not exist
        THEN returns the HTTP.404 exception code`, async () => {
      const payload = mockUserPayload();

      const response = await request(app.getHttpServer())
        .put(`/users/${random.id()}`)
        .send(payload)
        .expect(404);

      expect(response.body.code).toBe('HTTP.404');
    });
  });

  afterEach(async () => {
    await UserModel.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });
});
