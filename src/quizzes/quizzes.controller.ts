import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiExceptionResponse } from '../common/decorators';
import { httpExceptionExamples } from '../common/exceptions';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './schemas';
import { QuizParams, QuizPayload } from './dto';

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
  @ApiExceptionResponse({
    status: 400,
    example: httpExceptionExamples.ValidationException.value,
  })
  createQuiz(@Body() payload: QuizPayload): Promise<Quiz> {
    return this.quizzesService.create(payload);
  }

  @Get()
  @ApiOperation({ summary: 'Get all the existing quizzes' })
  findQuizzes(): Promise<Quiz[]> {
    return this.quizzesService.find();
  }

  @Put(':quizId')
  @ApiOperation({ summary: 'Update an existing quiz' })
  @ApiExceptionResponse({
    status: 400,
    example: httpExceptionExamples.ValidationException.value,
  })
  @ApiExceptionResponse({
    status: 404,
    example: httpExceptionExamples.NotFoundException.value,
  })
  async updateQuiz(@Param() params: QuizParams, @Body() payload: QuizPayload): Promise<Quiz> {
    const updatedQuiz = await this.quizzesService.update(params.quizId, payload);

    if (!updatedQuiz) {
      throw new NotFoundException();
    }

    return updatedQuiz;
  }

  @Delete(':quizId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an existing quiz' })
  @ApiExceptionResponse({
    status: 400,
    example: httpExceptionExamples.ValidationException.value,
  })
  @ApiExceptionResponse({
    status: 404,
    example: httpExceptionExamples.NotFoundException.value,
  })
  async deleteQuiz(@Param() params: QuizParams): Promise<void> {
    const deletedQuiz = await this.quizzesService.delete(params.quizId);

    if (!deletedQuiz) {
      throw new NotFoundException();
    }
  }
}
