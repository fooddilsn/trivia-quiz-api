import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Type } from 'class-transformer';
import { Answer, AnswerSchema } from './answer.schema';

@Schema({ _id: false })
export class Question {
  @Prop({ required: true })
  text: string;

  @Prop({ type: [AnswerSchema], required: true })
  @Type(() => Answer)
  answers: Answer[];
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
