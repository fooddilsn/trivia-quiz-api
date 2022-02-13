import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class AnswerPayload {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsOptional()
  @IsBoolean()
  correct?: boolean;
}
