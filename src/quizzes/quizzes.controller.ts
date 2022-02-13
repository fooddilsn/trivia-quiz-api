import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './schemas';
import { QuizPayload } from './dto';

@ApiTags('quizzes')
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a quiz',
    description:
      'A **quiz** has a name and includes a collection of **questions**.\n\n' +
      'A **question** must have precisely four possible **answers**: one of those must be the correct one.',
  })
  createQuiz(@Body() payload: QuizPayload): Promise<Quiz> {
    return this.quizzesService.create(payload);
  }
}