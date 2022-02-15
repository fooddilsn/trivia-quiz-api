import { ExecutionContext } from '@nestjs/common';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Request } from '../../common/interfaces';
import { random } from '../../common/utils';
import { AuthUser } from '../auth.interfaces';
import { JwtAuthGuard } from '../guards';

export const mockJwtAuthGuard = (): DeepMocked<JwtAuthGuard> & { user: AuthUser } => {
  const user = {
    id: random.id(),
    email: 'john.doe@test.com',
  };

  return {
    ...createMock<JwtAuthGuard>({
      canActivate: (context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest<Request>();
        request.user = user;

        return true;
      },
    }),
    user,
  };
};
