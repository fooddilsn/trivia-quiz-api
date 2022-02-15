import { HttpStatus } from '@nestjs/common';
import { Exception } from '../common/exceptions';

export enum UserExceptionCode {
  ExistingEmailException = 'USER.001',
}

export const throwExistingEmailException = (): never => {
  throw new Exception(
    {
      code: UserExceptionCode.ExistingEmailException,
      message: 'Email already registered',
    },
    HttpStatus.BAD_REQUEST
  );
};

export const userExceptionExamples = {
  ExistingEmailException: {
    summary: 'Existing email exception',
    value: {
      code: 'USER.001',
      message: 'Email already registered',
    },
  },
};
