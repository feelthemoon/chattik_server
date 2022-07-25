import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { TokenExpiredError } from 'jsonwebtoken';
import { AuthenticationService } from '../../modules/authentication/authentication.service';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AtGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly authService: AuthenticationService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const accessToken = request.headers.authorization.split(' ')[1];
    const refreshToken = request.cookies['Refresh'];

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException({
        message: [{ type: 'common_error', text: 'Unauthorized' }],
      });
    }
    try {
      this.jwtService.verify(accessToken, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
      });
      return super.canActivate(context) as Promise<boolean>;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        const newAccessToken = await this.authService.refreshToken(
          this.jwtService.decode(accessToken).sub,
          refreshToken,
        );
        request.headers.authorization = `Bearer ${newAccessToken}`;
        response.setHeader('Access-Control-Expose-Headers', 'Authorization');
        response.setHeader('Authorization', `Bearer ${newAccessToken}`);
        return super.canActivate(context) as Promise<boolean>;
      }
      return false;
    }
  }
}
