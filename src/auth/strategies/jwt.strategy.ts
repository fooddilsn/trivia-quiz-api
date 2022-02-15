import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Config } from '../../config';
import { AuthConfig, AuthUser, TokenPayload } from '../auth.interfaces';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService<Config>,
    private readonly authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: configService.get<AuthConfig>('auth').jwt.issuer,
      secretOrKey: configService.get<AuthConfig>('auth').jwt.publicKey,
      ignoreExpiration: false,
    });
  }

  async validate(payload: TokenPayload): Promise<AuthUser> {
    const user = await this.authService.findUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
