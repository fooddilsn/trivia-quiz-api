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
import { QuizzesModule } from '../quizzes.module';
import { QuizDocument, Quiz } from '../schemas';
import { mockQuiz, mockQuizPayload, mockQuestionPayload, mockAnswerPayload } from './quizzes.mocks';

describe('Quizzes (e2e)', () => {
  let app: INestApplication;
  let QuizModel: Model<QuizDocument>;

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
    QuizModel = moduleRef.get<Model<QuizDocument>>(getModelToken(Quiz.name));

    await app.init();
  });

  describe('POST /quizzes', () => {
    it(`GIVEN a user who wants to create a quiz
        WHEN the request is well-formed THEN returns the new quiz`, async () => {
      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.stringMatching(/^[a-f0-9]{24}$/),
        ...payload,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it(`GIVEN a user who wants to create a quiz
        WHEN the request has not a well-formed payload THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .post('/quizzes')
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

    it(`GIVEN a user who wants to create a quiz
        WHEN the request has a payload with not well-formed questions THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockQuizPayload([{ invalid: true }]);

      const response = await request(app.getHttpServer())
        .post('/quizzes')
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

    it(`GIVEN a user who wants to create a quiz
        WHEN the request has a payload with not well-formed answers THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockQuizPayload([mockQuestionPayload([{ invalid: true }])]);

      const response = await request(app.getHttpServer())
        .post('/quizzes')
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

    it(`GIVEN a user who wants to create a quiz
        WHEN the request has a payload with no correct answers THEN returns the HTTP.400 exception code`, async () => {
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
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual([
        'questions.0.answers must contain one correct answer',
      ]);
    });

    it(`GIVEN a user who wants to create a quiz
        WHEN the request has a payload with multiple correct answers THEN returns the HTTP.400 exception code`, async () => {
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
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual([
        'questions.0.answers must contain one correct answer',
      ]);
    });
  });

  describe('GET /quizzes', () => {
    it(`GIVEN a user who wants to list all the existing quizzes
        WHEN the request is well-formed THEN returns the list of quizzes`, async () => {
      const quizzes = await QuizModel.create([mockQuiz(), mockQuiz(), mockQuiz()]);

      const response = await request(app.getHttpServer()).get('/quizzes').expect(200);

      expect(response.body.length).toBe(quizzes.length);
      expect(response.body).toEqual(
        expect.arrayContaining(
          quizzes.map((quiz) => ({
            ...quiz.toJSON(),
            createdAt: quiz.createdAt.toISOString(),
            updatedAt: quiz.updatedAt.toISOString(),
          }))
        )
      );
    });
  });

  describe('PUT /quizzes/:quizId', () => {
    it(`GIVEN a user who wants to update a quiz
        WHEN the request is well-formed THEN returns the updated quiz`, async () => {
      const quiz = new QuizModel(mockQuiz());
      await quiz.save();

      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .put(`/quizzes/${quiz.id}`)
        .send(payload)
        .expect(200);

      expect(response.body).toEqual({
        ...quiz.toJSON(),
        ...payload,
        createdAt: quiz.createdAt.toISOString(),
        updatedAt: expect.not.stringMatching(quiz.createdAt.toISOString()),
      });
    });

    it(`GIVEN a user who wants to update a quiz
        WHEN the request has not a well-formed quiz id THEN returns the HTTP.400 exception code`, async () => {
      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .put('/quizzes/invalid')
        .send(payload)
        .expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual(['quizId must be a mongodb id']);
    });

    it(`GIVEN a user who wants to update a quiz
        WHEN the request has not a well-formed payload THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .put(`/quizzes/${random.id()}`)
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

    it(`GIVEN a user who wants to update a quiz
        WHEN the request is well-formed BUT the quiz does not exist
        THEN returns the HTTP.404 exception code`, async () => {
      const payload = mockQuizPayload();

      const response = await request(app.getHttpServer())
        .put(`/quizzes/${random.id()}`)
        .send(payload)
        .expect(404);

      expect(response.body.code).toBe('HTTP.404');
    });
  });

  describe('DELETE /quizzes/:quizId', () => {
    it(`GIVEN a user who wants to delete a quiz
        WHEN the request is well-formed THEN returns nothing`, async () => {
      const quiz = new QuizModel(mockQuiz());
      await quiz.save();

      await request(app.getHttpServer()).delete(`/quizzes/${quiz.id}`).expect(204);
    });

    it(`GIVEN a user who wants to delete a quiz
        WHEN the request has not a well-formed quiz id THEN returns the HTTP.400 exception code`, async () => {
      const response = await request(app.getHttpServer()).delete('/quizzes/invalid').expect(400);

      expect(response.body.code).toBe('HTTP.400');
      expect(response.body.details).toEqual(['quizId must be a mongodb id']);
    });

    it(`GIVEN a user who wants to delete a quiz
        WHEN the request is well-formed BUT the quiz does not exist
        THEN returns the HTTP.404 exception code`, async () => {
      const response = await request(app.getHttpServer())
        .delete(`/quizzes/${random.id()}`)
        .expect(404);

      expect(response.body.code).toBe('HTTP.404');
    });
  });

  afterEach(async () => {
    await QuizModel.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });
});
