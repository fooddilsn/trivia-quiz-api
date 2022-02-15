import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiExceptionResponse } from '../common/decorators';
import { httpExceptionExamples } from '../common/exceptions';
import { UsersService } from './users.service';
import { throwExistingEmailException, userExceptionExamples } from './users.exceptions';
import { User } from './schemas';
import { UserPayload } from './dto';

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
}
