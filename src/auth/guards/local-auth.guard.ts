import { Injectable, ExecutionContext, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Request } from '../../common/interfaces';
import { CredentialsPayload } from '../dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const errors = await validate(plainToClass(CredentialsPayload, request.body), {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length) {
      throw new BadRequestException(errors.map((error) => Object.values(error.constraints)).flat());
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
