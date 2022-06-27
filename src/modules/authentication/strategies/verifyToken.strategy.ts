import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types';

@Injectable()
export class VerifyTokenStrategy extends PassportStrategy(Strategy, 'jwt-verify') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req.query.token,
      secretOrKey: config.get<string>('VERIFY_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: JwtPayload): JwtPayload {
    const recoverToken = req.query.token;

    if (!recoverToken)
      throw new ForbiddenException({
        message: [{ type: 'common_error', text: 'Verify token malformed' }],
      });

    return payload;
  }
}
