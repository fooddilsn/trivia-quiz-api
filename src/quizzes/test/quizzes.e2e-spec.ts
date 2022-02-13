import { Test } from '@nestjs/testing';
import { APP_PIPE } from '@nestjs/core';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as request from 'supertest';
import config, { envSchema, Config, MongoDBConfig } from '../../config';
import { LoggerModule } from '../../logger/logger.module';
import { QuizzesModule } from '../quizzes.module';
import { mockQuizPayload, mockQuestionPayload, mockAnswerPayload } from './quizzes.mocks';

describe('Quizzes (e2e)', () => {
  let app: INestApplication;

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
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('POST /quizzes', () => {
    it(`GIVEN a user who wants to create a quiz
        WHEN the request has a well-formed payload THEN returns the new quiz`, async () => {
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
        WHEN the request has a malformed payload THEN returns 400 (Bad Request)`, async () => {
      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .send({ malformed: true })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message.length).toBe(5);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'name must be a string',
          'name should not be empty',
          'questions must be an array',
          'questions should not be empty',
          'property malformed should not exist',
        ])
      );
    });

    it(`GIVEN a user who wants to create a quiz
        WHEN the request has a payload with malformed questions THEN returns 400 (Bad Request)`, async () => {
      const payload = mockQuizPayload([{ malformed: true }]);

      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .send(payload)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message.length).toBe(7);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'questions.0.text must be a string',
          'questions.0.text should not be empty',
          'questions.0.answers must be an array',
          'questions.0.answers must contain at least 4 elements',
          'questions.0.answers must contain not more than 4 elements',
          'questions.0.answers must contain one correct answer',
          'questions.0.property malformed should not exist',
        ])
      );
    });

    it(`GIVEN a user who wants to create a quiz
        WHEN the request has a payload with malformed answers THEN returns 400 (Bad Request)`, async () => {
      const payload = mockQuizPayload([mockQuestionPayload([{ malformed: true }])]);

      const response = await request(app.getHttpServer())
        .post('/quizzes')
        .send(payload)
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message.length).toBe(5);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'questions.0.answers must contain at least 4 elements',
          'questions.0.answers must contain one correct answer',
          'questions.0.answers.0.text must be a string',
          'questions.0.answers.0.text should not be empty',
          'questions.0.answers.0.property malformed should not exist',
        ])
      );
    });

    it(`GIVEN a user who wants to create a quiz
        WHEN the request has a payload with no correct answers THEN returns 400 (Bad Request)`, async () => {
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

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toEqual([
        'questions.0.answers must contain one correct answer',
      ]);
    });

    it(`GIVEN a user who wants to create a quiz
        WHEN the request has a payload with multiple correct answers THEN returns 400 (Bad Request)`, async () => {
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

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toEqual([
        'questions.0.answers must contain one correct answer',
      ]);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
