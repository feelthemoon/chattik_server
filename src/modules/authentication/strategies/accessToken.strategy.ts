import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../types';
import { RedisService } from 'nestjs-redis';
import { Request } from 'express';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly config: ConfigService, private readonly redisService: RedisService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('ACCESS_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const redisClient = this.redisService.getClient('revoked_tokens');
    const isTokenRevoked = await redisClient.get(req.headers.authorization);
    if (isTokenRevoked) {
      throw new UnauthorizedException({
        message: [{ type: 'common_error', text: 'Unauthorized' }],
      });
    }
    return payload;
  }
}
