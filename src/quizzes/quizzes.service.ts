import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, QueryOptions } from 'mongoose';
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

  async create(data: QuizPayload, userId: string): Promise<Quiz> {
    this.logger.debug('Creating quiz...', {
      fn: this.create.name,
      data,
      userId,
    });

    const doc = new this.quizModel({ ...data, userId });
    await doc.save();

    const quiz = plainToInstance(Quiz, doc.toJSON());

    this.logger.debug('Quiz created', {
      fn: this.create.name,
      quiz,
    });

    return quiz;
  }

  async find(filter: FilterQuery<Quiz> = {}, options?: QueryOptions): Promise<Quiz[]> {
    this.logger.debug('Finding quizzes...', {
      fn: this.find.name,
      filter,
    });

    const docs = await this.quizModel.find(filter, null, options).exec();

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

  async count(filter: FilterQuery<Quiz> = {}): Promise<number> {
    this.logger.log('Counting quizzes...', {
      fn: this.count.name,
      filter,
    });

    const count = await this.quizModel.countDocuments(filter).exec();

    this.logger.log('Quizzes counted...', {
      fn: this.count.name,
      count,
    });

    return count;
  }

  async findById(id: string): Promise<Quiz | null> {
    this.logger.debug('Finding quiz by id...', {
      fn: this.findById.name,
      quizId: id,
    });

    const doc = await this.quizModel.findById(id).exec();

    if (!doc) {
      this.logger.debug('Quiz not found', {
        fn: this.findById.name,
        quizId: id,
      });

      return null;
    }

    const quiz = plainToInstance(Quiz, doc.toJSON());

    this.logger.debug('Quiz found', {
      fn: this.findById.name,
      quiz,
    });

    return quiz;
  }

  async update(id: string, data: QuizPayload): Promise<Quiz | null> {
    this.logger.debug('Updating quiz...', {
      fn: this.update.name,
      quizId: id,
      data,
    });

    const doc = await this.quizModel.findById(id).exec();

    if (!doc) {
      this.logger.debug('Quiz not found', {
        fn: this.update.name,
        quizId: id,
      });

      return null;
    }

    Object.assign(doc, data);
    await doc.save();

    const quiz = plainToInstance(Quiz, doc.toJSON());

    this.logger.debug('Quiz updated', {
      fn: this.update.name,
      quiz,
    });

    return quiz;
  }

  async delete(id: string): Promise<Quiz | null> {
    this.logger.debug('Deleting quiz...', {
      fn: this.delete.name,
      quizId: id,
    });

    const doc = await this.quizModel.findByIdAndDelete(id).exec();

    if (!doc) {
      this.logger.debug('Quiz not found', {
        fn: this.delete.name,
        quizId: id,
      });

      return null;
    }

    const quiz = plainToInstance(Quiz, doc.toJSON());

    this.logger.debug('Quiz deleted', {
      fn: this.delete.name,
      quiz,
    });

    return quiz;
  }
}
