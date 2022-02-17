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
import { UserDocument, User } from '../../users/schemas';
import { mockUser } from '../../users/test/users.mocks';
import { QuizzesModule } from '../quizzes.module';
import { QuizDocument, Quiz } from '../schemas';
import { mockQuiz, mockQuizPayload, mockQuestionPayload, mockAnswerPayload } from './quizzes.mocks';

describe('Quizzes (e2e)', () => {
  let app: INestApplication;

  let UserModel: Model<UserDocument>;
  let QuizModel: Model<QuizDocument>;

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
    }).compile();

    app = moduleRef.createNestApplication();
    const jwtService = moduleRef.get(JwtService);
    auth.accessToken = jwtService.sign({ sub: auth.user.id, email: auth.user.email });

    UserModel = moduleRef.get<Model<UserDocument>>(getModelToken(User.name));
    QuizModel = moduleRef.get<Model<QuizDocument>>(getModelToken(Quiz.name));

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

  describe('POST /quizzes', () => {
    it(`GIVEN an authorized user who wants to create a quiz
        WHEN the request is well-formed THEN returns the new quiz`, async () => {
      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.stringMatching(/^[a-f0-9]{24}$/),
        ...payload,
        userId: auth.user.id,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it(`GIVEN an authorized user who wants to create a quiz
        WHEN the request has not a well-formed payload THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send({ invalid: true })
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details.length).toBe(5);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          'name must be a string',
          'name should not be empty',
          'questions must be an array',
          'questions should not be empty',
          'property invalid should not exist',
        ])
      );
    });

    it(`GIVEN an authorized user who wants to create a quiz
        WHEN the request has a payload with not well-formed questions THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockQuizPayload([{ invalid: true }]);

      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details.length).toBe(7);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          'questions.0.text must be a string',
          'questions.0.text should not be empty',
          'questions.0.answers must be an array',
          'questions.0.answers must contain at least 4 elements',
          'questions.0.answers must contain not more than 4 elements',
          'questions.0.answers must contain one correct answer',
          'questions.0.property invalid should not exist',
        ])
      );
    });

    it(`GIVEN an authorized user who wants to create a quiz
        WHEN the request has a payload with not well-formed answers THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockQuizPayload([mockQuestionPayload([{ invalid: true }])]);

      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details.length).toBe(5);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          'questions.0.answers must contain at least 4 elements',
          'questions.0.answers must contain one correct answer',
          'questions.0.answers.0.text must be a string',
          'questions.0.answers.0.text should not be empty',
          'questions.0.answers.0.property invalid should not exist',
        ])
      );
    });

    it(`GIVEN an authorized user who wants to create a quiz
        WHEN the request is well-formed BUT the correct answer is missing
        THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockQuizPayload([
        mockQuestionPayload([
          mockAnswerPayload(),
          mockAnswerPayload(),
          mockAnswerPayload(),
          mockAnswerPayload(),
        ]),
      ]);

      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual([
        'questions.0.answers must contain one correct answer',
      ]);
    });

    it(`GIVEN an authorized user who wants to create a quiz
        WHEN the request is well-formed BUT there is more than one correct answer
        THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockQuizPayload([
        mockQuestionPayload([
          mockAnswerPayload(),
          mockAnswerPayload(true),
          mockAnswerPayload(true),
          mockAnswerPayload(),
        ]),
      ]);

      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual([
        'questions.0.answers must contain one correct answer',
      ]);
    });

    it('GIVEN an unauthorized user who wants to create a quiz THEN returns the HTTP.401 exception code', async () => {
      const response = await request(app.getHttpServer()).post('/quizzes').expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });
  });

  describe('GET /quizzes', () => {
    it(`GIVEN an authorized user who wants to list his/her existing quizzes
        WHEN the request is well-formed AND default pagination values are used
        THEN returns the paginated list of quizzes`, async () => {
      const quizzes = await QuizModel.create([
        mockQuiz(),
        mockQuiz(auth.user.id),
        mockQuiz(),
        mockQuiz(auth.user.id),
        mockQuiz(auth.user.id),
      ]);

      const response = await request(app.getHttpServer())
        .get('/quizzes')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .expect(200);

      const userQuizzes = quizzes.filter((quiz) => quiz.userId === auth.user.id);

      expect(response.body.data.length).toBe(userQuizzes.length);
      expect(response.body).toEqual({
        data: expect.arrayContaining(
          userQuizzes.map((quiz) => ({
            ...quiz.toJSON(),
            createdAt: quiz.createdAt.toISOString(),
            updatedAt: quiz.updatedAt.toISOString(),
          }))
        ),
        page: 1,
        size: userQuizzes.length,
        pages: 1,
        total: userQuizzes.length,
      });
    });

    it(`GIVEN an authorized user who wants to list his/her existing quizzes
        WHEN the request is well-formed AND pagination values are provided by the user
        THEN returns the paginated list of quizzes`, async () => {
      const quizzes = await QuizModel.create([
        mockQuiz(),
        mockQuiz(auth.user.id),
        mockQuiz(),
        mockQuiz(auth.user.id),
        mockQuiz(auth.user.id),
      ]);

      const response = await request(app.getHttpServer())
        .get('/quizzes')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .query({ page: 2, size: 2 })
        .expect(200);

      const userQuizzes = quizzes.filter((quiz) => quiz.userId === auth.user.id).splice(2);

      expect(response.body.data.length).toBe(userQuizzes.length);
      expect(response.body).toEqual({
        data: expect.arrayContaining(
          userQuizzes.map((quiz) => ({
            ...quiz.toJSON(),
            createdAt: quiz.createdAt.toISOString(),
            updatedAt: quiz.updatedAt.toISOString(),
          }))
        ),
        page: 2,
        size: 1,
        pages: 2,
        total: 3,
      });
    });

    it('GIVEN an unauthorized user who wants to list all the existing quizzes THEN returns the HTTP.401 exception code', async () => {
      const response = await request(app.getHttpServer()).post('/quizzes').expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });
  });

  describe('PUT /quizzes/:quizId', () => {
    it(`GIVEN an authorized user who wants to update a quiz
        WHEN the request is well-formed THEN returns the updated quiz`, async () => {
      const quiz = new QuizModel(mockQuiz(auth.user.id));
      await quiz.save();

      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .put(`/quizzes/${quiz.id}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(200);

      expect(response.body).toEqual({
        ...quiz.toJSON(),
        ...payload,
        createdAt: quiz.createdAt.toISOString(),
        updatedAt: expect.not.stringMatching(quiz.createdAt.toISOString()),
      });
    });

    it(`GIVEN an authorized user who wants to update a quiz
        WHEN the request has not a well-formed quiz id THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .put('/quizzes/invalid')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual(['quizId must be a mongodb id']);
    });

    it(`GIVEN an authorized user who wants to update a quiz
        WHEN the request has not a well-formed payload THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .put(`/quizzes/${random.id()}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send({ invalid: true })
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details.length).toBe(5);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          'name must be a string',
          'name should not be empty',
          'questions must be an array',
          'questions should not be empty',
          'property invalid should not exist',
        ])
      );
    });

    it('GIVEN an unauthorized user who wants to update a quiz THEN returns the HTTP.401 exception code', async () => {
      const response = await request(app.getHttpServer())
        .put(`/quizzes/${random.id()}`)
        .expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });

    it(`GIVEN an authorized user who wants to update a quiz
        WHEN the request is well-formed BUT the quiz is owned by another user
        THEN returns the HTTP.403 exception code`, async () => {
      const quiz = new QuizModel(mockQuiz());
      await quiz.save();

      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .put(`/quizzes/${quiz.id}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(403);

      expect(response.body.code).toBe('HTTP.403');
    });

    it(`GIVEN an authorized user who wants to update a quiz
        WHEN the request is well-formed BUT the quiz does not exist
        THEN returns the HTTP.404 exception code`, async () => {
      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .put(`/quizzes/${random.id()}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(404);

      expect(response.body.code).toBe('HTTP.404');
    });
  });

  describe('DELETE /quizzes/:quizId', () => {
    it(`GIVEN an authorized user who wants to delete a quiz
        WHEN the request is well-formed THEN returns nothing`, async () => {
      const quiz = new QuizModel(mockQuiz(auth.user.id));
      await quiz.save();

      await request(app.getHttpServer())
        .delete(`/quizzes/${quiz.id}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .expect(204);
    });

    it(`GIVEN an authorized user who wants to delete a quiz
        WHEN the request has not a well-formed quiz id THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .delete('/quizzes/invalid')
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual(['quizId must be a mongodb id']);
    });

    it('GIVEN an unauthorized user who wants to delete a quiz THEN returns the HTTP.401 exception code', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/quizzes/${random.id()}`)
        .expect(401);

      expect(response.body.code).toBe('HTTP.401');
    });

    it(`GIVEN an authorized user who wants to delete a quiz
        WHEN the request is well-formed BUT the quiz is owned by another user
        THEN returns the HTTP.403 exception code`, async () => {
      const quiz = new QuizModel(mockQuiz());
      await quiz.save();

      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .delete(`/quizzes/${quiz.id}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .send(payload)
        .expect(403);

      expect(response.body.code).toBe('HTTP.403');
    });

    it(`GIVEN an authorized user who wants to delete a quiz
        WHEN the request is well-formed BUT the quiz does not exist
        THEN returns the HTTP.404 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .delete(`/quizzes/${random.id()}`)
        .set({
          Authorization: `Bearer ${auth.accessToken}`,
        })
        .expect(404);

      expect(response.body.code).toBe('HTTP.404');
    });
  });

  afterEach(async () => {
    await UserModel.deleteMany();
    await QuizModel.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });
});
