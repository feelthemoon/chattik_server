import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (request.cookies['Refresh']) {
      return true;
    }
    throw new UnauthorizedException({
      message: [{ type: 'common_error', text: 'Unauthorized' }],
    });
  }
}
