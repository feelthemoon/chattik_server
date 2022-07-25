import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export const GetCurrentUserIdFromRefreshToken = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request: Request = context.switchToHttp().getRequest();
    const jwt = new JwtService();
    return jwt.decode(request.cookies['Refresh'])?.sub;
  },
);

export const GetCurrentUserIdFromAccessToken = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request: Request = context.switchToHttp().getRequest();
    const jwt = new JwtService();
    return jwt.decode(request.headers.authorization.split(' ')[1])?.sub;
  },
);

export const GetCurrentUserIdFromRecoverToken = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => {
    const request: Request = context.switchToHttp().getRequest();
    const jwt = new JwtService();
    if (request.query.token && typeof request.query.token === 'string') {
      return jwt.decode(request.query.token)?.sub;
    }
  },
);
