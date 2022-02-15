import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import ms from 'ms';
import { Config } from '../config';
import { LoggerService } from '../logger/logger.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas';
import { omitUserPassword } from '../users/users.utils';
import { AuthConfig, TokenPayload } from './auth.interfaces';
import { verifyPassword } from './auth.utils';
import { AuthToken } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService<Config>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService
  ) {
    this.logger.setContext(AuthService.name);
  }

  async findUserById(id: string): Promise<User | null> {
    return this.usersService.findById(id);
  }

  async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
    this.logger.debug('Validating user credentials...', {
      fn: this.validateUser.name,
      user: { email },
    });

    const user = await this.usersService.findOne({ email });

    if (user && verifyPassword(password, user.password)) {
      return omitUserPassword(user);
    }

    return null;
  }

  issueAuthToken(payload: Pick<TokenPayload, 'sub' | 'email'>): AuthToken {
    this.logger.debug('Issuing auth token...', {
      fn: this.issueAuthToken.name,
      payload,
    });

    const authConfig = this.configService.get<AuthConfig>('auth');

    const authToken = {
      accessToken: this.jwtService.sign(payload),
      expiresIn: ms(authConfig.jwt.signOptions.expiresIn) / 1000,
    };

    this.logger.debug('Auth token...', {
      fn: this.issueAuthToken.name,
      authToken,
    });

    return authToken;
  }
}
