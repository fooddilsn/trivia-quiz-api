import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UniqueCorrectAnswer } from '../decorators';
import { AnswerPayload } from './answer.payload';

export class QuestionPayload {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @UniqueCorrectAnswer()
  @ValidateNested({ each: true })
  @Type(() => AnswerPayload)
  answers: AnswerPayload[];
}
