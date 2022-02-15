import { IsString, IsNotEmpty, IsEmail, Matches } from 'class-validator';

export class UserPayload {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%?&*.])[A-Za-z0-9@$!%?&*.]{8,}$/, {
    message: (args) =>
      `${args.property} must contain at least 8 characters including a lower-case letter, an upper-case letter, a number, and a special character (@$!%?&*.)`,
  })
  password: string;
}
