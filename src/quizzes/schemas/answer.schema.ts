import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Answer {
  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  correct: boolean;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
