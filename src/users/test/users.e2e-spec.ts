import { Test } from '@nestjs/testing';
import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'supertest';
import config, { envSchema, Config, MongoDBConfig } from '../../config';
import { ExceptionsFilter } from '../../common/exceptions';
import { random } from '../../common/test';
import { LoggerModule } from '../../logger/logger.module';
import { AuthModule } from '../../auth/auth.module';
import { mockAuthUser } from '../../auth/test/auth.mocks';
import { UsersModule } from '../users.module';
import { UserDocument, User } from '../schemas';
import { mockUser, mockUserPayload } from './users.mocks';

describe('Users (e2e)', () => {
  let app: INestApplication;

  let UserModel: Model<UserDocument>;

  const auth = {
    user: mockAuthUser(),
    accessToken: null,
  };

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
          useFactory: async (configService: ConfigService<Config>) => {
            const { migrations, ...mongooseConfig } = configService.get<MongoDBConfig>('mongodb');
            return mongooseConfig;
          },
          inject: [ConfigService],
        }),
        AuthModule,
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
    const jwtService = moduleRef.get(JwtService);
    auth.accessToken = jwtService.sign({ sub: auth.user.id, email: auth.user.email });

    UserModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));

    await app.init();
  });

  beforeEach(async () => {
    const user = new UserModel({
      _id: auth.user.id,
      email: auth.user.email,
      ...mockUser(),
    });
    await user.save();
  });

  describe('POST /users', () => {
    it(`GIVEN an authorized user who wants to create a user
        WHEN the request is well-formed THEN returns the new user`, async () => {
      const payload = mockUserPayload();

      const response = await request(app.getHttpServer())
        .post('/users')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.stringMatching(/^[a-f0-9]{24}$/),
        ...payload,
        fullName: `${payload.firstName} ${payload.lastName}`,
        password: undefined,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it(`GIVEN an authorized user who wants to create a user
        WHEN the request has not a well-formed payload THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
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

    it(`GIVEN an authorized user who wants to create a user
        WHEN the request is well-formed BUT another user is registered with the same email
        THEN returns the USER.001 exception code`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      const payload = mockUserPayload(user.email);

      const response = await request(app.getHttpServer())
        .post('/users')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('USER.001');
    });

    it('GIVEN an unauthorized user who wants to create a user THEN returns the HTTP.401 exception code', async () => {
      const response = await request(app.getHttpServer()).post('/users').expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });
  });

  describe('PUT /users/:userId', () => {
    it(`GIVEN an authorized user who wants to update a user
        WHEN the request is well-formed THEN returns the updated user`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      const payload = mockUserPayload(user.email);

      const response = await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
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

    it(`GIVEN an authorized user who wants to update a user
        WHEN the request has not a well-formed user id THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockUserPayload();

      const response = await request(app.getHttpServer())
        .put('/users/invalid')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual(['userId must be a mongodb id']);
    });

    it(`GIVEN an authorized user who wants to update a user
        WHEN the request has not a well-formed payload THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .put(`/users/${random.id()}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
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

    it(`GIVEN an authorized user who wants to update a user
        WHEN the request is well-formed BUT another user is registered with the same email
        THEN returns the USER.001 exception code`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      const payload = mockUserPayload(user.email);

      const response = await request(app.getHttpServer())
        .put(`/users/${random.id()}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('USER.001');
    });

    it('GIVEN an unauthorized user who wants to update a user THEN returns the HTTP.401 exception code', async () => {
      const response = await request(app.getHttpServer()).put(`/users/${random.id()}`).expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });

    it(`GIVEN an authorized user who wants to update a user
        WHEN the request is well-formed BUT the user does not exist
        THEN returns the HTTP.404 exception code`, async () => {
      const payload = mockUserPayload();

      const response = await request(app.getHttpServer())
        .put(`/users/${random.id()}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(404);

      expect(response.body.code).toBe('HTTP.404');
    });
  });

  describe('DELETE /users/:userId', () => {
    it(`GIVEN an authorized user who wants to delete a user
        WHEN the request is well-formed THEN returns nothing`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .expect(204);
    });

    it(`GIVEN an authorized user who wants to delete a user
        WHEN the request has not a well-formed user id THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .delete('/users/invalid')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual(['userId must be a mongodb id']);
    });

    it('GIVEN an unauthorized user who wants to delete a user THEN returns the HTTP.401 exception code', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${random.id()}`)
        .expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });

    it(`GIVEN an authorized user who wants to delete a user
        WHEN the request is well-formed BUT the user does not exist
        THEN returns the HTTP.404 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${random.id()}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
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
