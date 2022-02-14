import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { plainToInstance } from 'class-transformer';
import { LoggerService } from '../logger/logger.service';
import { QuizDocument, Quiz } from './schemas';
import { QuizPayload } from './dto';

@Injectable()
export class QuizzesService {
  constructor(
    private readonly logger: LoggerService,
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>
  ) {
    this.logger.setContext(QuizzesService.name);
  }

  async create(data: QuizPayload): Promise<Quiz> {
    this.logger.debug('Creating quiz...', {
      fn: this.create.name,
      data,
    });

    const doc = new this.quizModel(data);
    await doc.save();

    const quiz = plainToInstance(Quiz, doc.toJSON());

    this.logger.debug('Quiz created', {
      fn: this.create.name,
      quiz,
    });

    return quiz;
  }

  async find(): Promise<Quiz[]> {
    this.logger.debug('Finding quizzes...', {
      fn: this.find.name,
    });

    const docs = await this.quizModel.find().exec();

    const quizzes = plainToInstance(
      Quiz,
      docs.map((doc) => doc.toJSON())
    );

    this.logger.debug('Quizzes found', {
      fn: this.find.name,
      quizzes,
    });

    return quizzes;
  }
}
