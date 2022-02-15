import { Algorithm } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { User } from '../users/schemas';

export interface AuthConfig {
  jwt: {
    issuer: string;
    algorithm: Algorithm;
    publicKey: string;
    privateKey: string;
    signOptions: {
      expiresIn: StringValue;
    };
  };
}

export type AuthUser = Pick<User, 'id' | 'email'>;

export interface TokenPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
  iss: string;
}
