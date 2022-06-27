import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export class VerifyTokenGuard extends AuthGuard('jwt-verify') {
  constructor() {
    super();
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    if (request.query.token) {
      return super.canActivate(context);
    }
    throw new UnauthorizedException({
      message: [{ type: 'common_error', text: 'Unauthorized' }],
    });
  }
}
