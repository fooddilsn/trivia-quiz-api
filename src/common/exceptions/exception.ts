import { HttpException } from '@nestjs/common';

export interface ExceptionResponse {
  code: string;
  message: string;
  details?: string[] | Record<string, unknown>;
}

export class Exception extends HttpException {
  constructor(response: ExceptionResponse, status: number) {
    super(response, status);
  }

  code: string;
  message: string;
  details?: string[] | Record<string, unknown>;
}
