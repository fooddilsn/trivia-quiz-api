import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Type } from 'class-transformer';
import { normalizeMongoDocument } from '../../common/utils';
import { Question, QuestionSchema } from './question.schema';

export type QuizDocument = Quiz & Document;

@Schema({
  strictQuery: 'throw',
  timestamps: true,
  toJSON: {
    transform: normalizeMongoDocument,
  },
})
export class Quiz {
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: [QuestionSchema], required: true })
  @Type(() => Question)
  questions: Question[];

  @Prop({ required: true })
  userId: string;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
