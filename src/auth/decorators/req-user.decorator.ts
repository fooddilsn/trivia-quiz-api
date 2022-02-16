import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from '../../common/interfaces';

export const ReqUser = createParamDecorator((data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();

  return request.user;
});