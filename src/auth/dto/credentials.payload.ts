import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CredentialsPayload {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
