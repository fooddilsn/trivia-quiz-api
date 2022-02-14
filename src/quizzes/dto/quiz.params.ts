import { IsMongoId } from 'class-validator';

export class QuizParams {
  @IsMongoId()
  quizId: string;
}
