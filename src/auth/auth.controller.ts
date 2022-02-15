import { Controller, UseGuards, Post, Get, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Request } from '../common/interfaces';
import { ApiExceptionResponse } from '../common/decorators';
import { httpExceptionExamples } from '../common/exceptions';
import { LoggerService } from '../logger/logger.service';
import { User } from '../users/schemas';
import { omitUserPassword } from '../users/users.utils';
import { AuthUser } from './auth.interfaces';
import { AuthService } from './auth.service';
import { ReqUser } from './decorators';
import { LocalAuthGuard, JwtAuthGuard } from './guards';
import { CredentialsPayload, AuthToken } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly logger: LoggerService, private readonly authService: AuthService) {
    this.logger.setContext(AuthController.name);
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Issue an access token' })
  @ApiBody({ type: CredentialsPayload })
  @ApiExceptionResponse({
    status: 400,
    example: httpExceptionExamples.ValidationException.value,
  })
  @ApiExceptionResponse({
    status: 401,
    example: httpExceptionExamples.UnauthorizedException.value,
  })
  async issueAuthToken(@Req() request: Request): Promise<AuthToken> {
    const { user } = request;

    return this.authService.issueAuthToken({
      sub: user.id,
      email: user.email,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the authenticated user' })
  @ApiExceptionResponse({
    status: 401,
    example: httpExceptionExamples.UnauthorizedException.value,
  })
  async getMe(@ReqUser() authUser: AuthUser): Promise<User> {
    const user = await this.authService.findUserById(authUser.id);

    return omitUserPassword(user);
  }
}
