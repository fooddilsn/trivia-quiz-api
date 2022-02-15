import {
  Controller,
  Post,
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
import { UsersService } from './users.service';
import { throwExistingEmailException, userExceptionExamples } from './users.exceptions';
import { User } from './schemas';
import { UserParams, UserPayload } from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a user',
    description:
      'A **user password** must contain at least 8 characters including a lower-case letter, an upper-case letter, a number, and a special character (`@$!%?&*.`).',
  })
  @ApiExceptionResponse({
    status: 400,
    examples: {
      ValidationException: httpExceptionExamples.ValidationException,
      ExistingEmailException: userExceptionExamples.ExistingEmailException,
    },
  })
  async createUser(@Body() payload: UserPayload): Promise<User> {
    const existingUser = await this.usersService.findOne({ email: payload.email });

    if (existingUser) {
      throwExistingEmailException();
    }

    return this.usersService.create(payload);
  }

  @Put(':userId')
  @ApiOperation({
    summary: 'Update an existing user',
    description:
      'A **user password** must contain at least 8 characters including a lower-case letter, an upper-case letter, a number, and a special character (`@$!%?&*.`).',
  })
  @ApiExceptionResponse({
    status: 400,
    examples: {
      ValidationException: httpExceptionExamples.ValidationException,
      ExistingEmailException: userExceptionExamples.ExistingEmailException,
    },
  })
  @ApiExceptionResponse({
    status: 404,
    example: httpExceptionExamples.NotFoundException.value,
  })
  async updateUser(@Param() params: UserParams, @Body() payload: UserPayload): Promise<User> {
    const existingUser = await this.usersService.findOne({
      _id: { $ne: params.userId },
      email: payload.email,
    });

    if (existingUser) {
      throwExistingEmailException();
    }

    const updatedUser = await this.usersService.update(params.userId, payload);

    if (!updatedUser) {
      throw new NotFoundException();
    }

    return updatedUser;
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an existing user' })
  @ApiExceptionResponse({
    status: 400,
    example: httpExceptionExamples.ValidationException.value,
  })
  @ApiExceptionResponse({
    status: 404,
    example: httpExceptionExamples.NotFoundException.value,
  })
  async deleteUser(@Param() params: UserParams): Promise<void> {
    const deletedUser = await this.usersService.delete(params.userId);

    if (!deletedUser) {
      throw new NotFoundException();
    }
  }
}
