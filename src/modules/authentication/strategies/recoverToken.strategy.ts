import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../types';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class RecoverTokenStrategy extends PassportStrategy(Strategy, 'jwt-recover') {
  constructor(config: ConfigService, private readonly redisService: RedisService) {
    super({
      jwtFromRequest: (req: Request) => req.query.token,
      secretOrKey: config.get<string>('RECOVER_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    const redisClient = this.redisService.getClient('revoked_tokens');
    const isTokenRevoked = await redisClient.get(req.query.token.toString());

    if (isTokenRevoked) {
      throw new UnauthorizedException({
        message: [{ type: 'common_error', text: 'Unauthorized' }],
      });
    }
    return payload;
  }
}
