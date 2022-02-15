import { Test, TestingModule } from '@nestjs/testing';
import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as request from 'supertest';
import config, { envSchema, Config, MongoDBConfig } from '../../config';
import { ExceptionsFilter } from '../../common/exceptions';
import { random } from '../../common/utils';
import { LoggerModule } from '../../logger/logger.module';
import { UserDocument, User } from '../../users/schemas';
import { mockUser } from '../../users/test/users.mocks';
import { AuthModule } from '../auth.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  let UserModel: Model<UserDocument>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
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
        AuthModule,
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
    jwtService = moduleRef.get(JwtService);

    UserModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));

    await app.init();
  });

  describe('POST /auth/token', () => {
    it(`GIVEN a user who wants to obtain an access token
        WHEN the request is well-formed THEN returns the access token`, async () => {
      const { password, ...rest } = mockUser();

      const user = new UserModel({ ...rest, password });
      await user.save();

      const response = await request(app.getHttpServer())
        .post('/auth/token')
        .send({
          email: user.email,
          password,
        })
        .expect(200);

      expect(response.body).toEqual({
        accessToken: jwtService.sign({ sub: user.id, email: user.email }),
        expiresIn: expect.any(Number),
      });
    });

    it(`GIVEN a user who wants to obtain an access token
        WHEN the request has not a well-formed payload THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/token')
        .send({ invalid: true })
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details.length).toBe(4);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          'email must be an email',
          'password must be a string',
          'password should not be empty',
          'property invalid should not exist',
        ])
      );
    });

    it(`GIVEN a user who wants to obtain an access token
        WHEN the request is well-formed BUT the user does not exist
        THEN returns the HTTP.401 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/token')
        .send({
          email: 'wrong.email@test.com',
          password: 'secret',
        })
        .expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });

    it(`GIVEN a user who wants to obtain an access token
        WHEN the request is well-formed BUT the password is wrong
        THEN returns the HTTP.401 exception code`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      const response = await request(app.getHttpServer())
        .post('/auth/token')
        .send({
          email: user.email,
          password: 'wrong.password',
        })
        .expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });
  });

  describe('GET /auth/me', () => {
    it(`GIVEN an authorized user who wants to get own data
        WHEN the request is well-formed THEN returns the user`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      const accessToken = jwtService.sign({ sub: user.id, email: user.email });

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set({
          Authorization: `Bearer ${accessToken}`,
        })
        .expect(200);

      expect(response.body).toEqual({
        ...user.toJSON(),
        fullName: `${user.firstName} ${user.lastName}`,
        password: undefined,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
    });

    it(`GIVEN an unauthorized user who wants to get own data
        WHEN the request is well-formed BUT the auth token is missing
        THEN returns the HTTP.401 exception code`, async () => {
      const response = await request(app.getHttpServer()).get('/auth/me').expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });

    it(`GIVEN an unauthorized user who wants to get own data
        WHEN the request is well-formed BUT the auth token is expired
        THEN returns the HTTP.401 exception code`, async () => {
      const user = new UserModel(mockUser());
      await user.save();

      const accessToken = jwtService.sign(
        { sub: user.id, email: user.email },
        { expiresIn: '1ms' }
      );

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set({
          Authorization: `Bearer ${accessToken}`,
        })
        .expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });

    it(`GIVEN an unauthorized user who wants to get own data
        WHEN the request is well-formed BUT the user does not exist anymore
        THEN returns the HTTP.401 exception code`, async () => {
      const accessToken = jwtService.sign({ sub: random.id(), email: 'john.doe@test.com' });

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set({
          Authorization: `Bearer ${accessToken}`,
        })
        .expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });
  });

  afterEach(async () => {
    await UserModel.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });
});
