import {
  Controller,
  UseGuards,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiExceptionResponse } from '../common/decorators';
import { httpExceptionExamples } from '../common/exceptions';
import { AuthUser } from '../auth/auth.interfaces';
import { ReqUser } from '../auth/decorators';
import { JwtAuthGuard } from '../auth/guards';
import { Action } from '../casl/casl.interfaces';
import { AbilityFactory } from '../casl/factories';
import { QuizzesService } from './quizzes.service';
import { Quiz } from './schemas';
import { QuizParams, QuizPayload } from './dto';

@ApiTags('quizzes')
@ApiBearerAuth()
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
export class QuizzesController {
  constructor(
    private readonly abilityFactory: AbilityFactory,
    private readonly quizzesService: QuizzesService
  ) {}

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
  @ApiExceptionResponse({
    status: 401,
    example: httpExceptionExamples.UnauthorizedException.value,
  })
  createQuiz(@Body() payload: QuizPayload, @ReqUser() authUser: AuthUser): Promise<Quiz> {
    return this.quizzesService.create(payload, authUser.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all your existing quizzes' })
  @ApiExceptionResponse({
    status: 401,
    example: httpExceptionExamples.UnauthorizedException.value,
  })
  findQuizzes(@ReqUser() authUser: AuthUser): Promise<Quiz[]> {
    return this.quizzesService.find({ userId: authUser.id });
  }

  @Put(':quizId')
  @ApiOperation({ summary: 'Update an existing quiz' })
  @ApiExceptionResponse({
    status: 400,
    example: httpExceptionExamples.ValidationException.value,
  })
  @ApiExceptionResponse({
    status: 401,
    example: httpExceptionExamples.UnauthorizedException.value,
  })
  @ApiExceptionResponse({
    status: 403,
    example: httpExceptionExamples.ForbiddenException.value,
  })
  @ApiExceptionResponse({
    status: 404,
    example: httpExceptionExamples.NotFoundException.value,
  })
  async updateQuiz(
    @Param() params: QuizParams,
    @Body() payload: QuizPayload,
    @ReqUser() authUser: AuthUser
  ): Promise<Quiz> {
    const quiz = await this.quizzesService.findById(params.quizId);

    if (!quiz) {
      throw new NotFoundException();
    }

    const ability = this.abilityFactory.create(authUser);

    if (ability.cannot(Action.Update, quiz)) {
      throw new ForbiddenException();
    }

    return this.quizzesService.update(params.quizId, payload);
  }

  @Delete(':quizId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an existing quiz' })
  @ApiExceptionResponse({
    status: 400,
    example: httpExceptionExamples.ValidationException.value,
  })
  @ApiExceptionResponse({
    status: 401,
    example: httpExceptionExamples.UnauthorizedException.value,
  })
  @ApiExceptionResponse({
    status: 403,
    example: httpExceptionExamples.ForbiddenException.value,
  })
  @ApiExceptionResponse({
    status: 404,
    example: httpExceptionExamples.NotFoundException.value,
  })
  async deleteQuiz(@Param() params: QuizParams, @ReqUser() authUser: AuthUser): Promise<void> {
    const quiz = await this.quizzesService.findById(params.quizId);

    if (!quiz) {
      throw new NotFoundException();
    }

    const ability = this.abilityFactory.create(authUser);

    if (ability.cannot(Action.Delete, quiz)) {
      throw new ForbiddenException();
    }

    await this.quizzesService.delete(params.quizId);
  }
}
