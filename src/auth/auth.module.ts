import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Config } from '../config';
import { UsersModule } from '../users/users.module';
import { AuthConfig } from './auth.interfaces';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy, JwtStrategy } from './strategies';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService<Config>) => {
        const authConfig = configService.get<AuthConfig>('auth');

        return {
          publicKey: authConfig.jwt.publicKey,
          privateKey: authConfig.jwt.privateKey,
          signOptions: {
            ...authConfig.jwt.signOptions,
            algorithm: authConfig.jwt.algorithm,
            issuer: authConfig.jwt.issuer,
          },
          verifyOptions: {
            algorithm: authConfig.jwt.algorithm,
            issuer: authConfig.jwt.issuer,
          },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
