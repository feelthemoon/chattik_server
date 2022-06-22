import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { hash, compare } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { SigninDto, SignupDto } from './authentication.dto';
import { JwtPayload, Tokens } from './types';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  async signin(signDto: SigninDto): Promise<Tokens> {
    const user = await this.usersService.findBy('email', signDto.email, true);
    if (!user) {
      throw new HttpException(
        { message: [{type: 'invalid_data', text: 'Invalid email or password'}] },
        HttpStatus.BAD_REQUEST,
      );
    }
    const isPasswordCompared = await compare(signDto.password, user.password);

    if (!isPasswordCompared) {
      throw new HttpException(
        { message: [{type: 'invalid_data', text: 'Invalid email or password'}] },
        HttpStatus.BAD_REQUEST,
      );
    }
    const tokens = await this.getTokens(user.id);
    const refreshHash = await hash(tokens.refresh_token, 10);
    await this.usersService.updateOne(user.id, 'refresh_hash', refreshHash);

    return tokens;
  }

  async signup(signupDto: SignupDto): Promise<Tokens> {
    const existingErrors = [];

    const isEmailInUse = await this.usersService.findBy(
      'email',
      signupDto.email,
    );
    if (isEmailInUse) existingErrors.push({ type: 'invalid_data_email', text: 'Email already in use' });

    const isUsernameInUse = await this.usersService.findBy(
      'username',
      signupDto.username,
    );
    if (isUsernameInUse) existingErrors.push({ type:'invalid_data_username', text: 'Username already in use' });

    if (existingErrors.length)
      throw new HttpException(
        { message: existingErrors },
        HttpStatus.BAD_REQUEST,
      );

    const hashPassword = await hash(signupDto.password, 10);

    const user = await this.usersService.create({
      ...signupDto,
      password: hashPassword,
    });

    const tokens = await this.getTokens(user.id);
    const refreshHash = await hash(tokens.refresh_token, 10);
    await this.usersService.updateOne(user.id, 'refresh_hash', refreshHash);

    return tokens;
  }

  async logout(userId: number, accessToken: string): Promise<boolean> {
    const redisClient = this.redisService.getClient('revoked_tokens');
    await redisClient.append(accessToken, 'true');

    await this.usersService.updateOne(userId, 'refresh_hash', null);
    return true;
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findBy('id', userId, false, true);

    if (!user.refresh_hash) throw new ForbiddenException();

    const isRefreshTokensCompared = await compare(
      refreshToken,
      user.refresh_hash,
    );
    if (!isRefreshTokensCompared) throw new UnauthorizedException();

    try {
      this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
      });
      return this.jwtService.sign(
        { sub: user.id },
        {
          secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: this.config.get<string>('ACCESS_TOKEN_EXPIRATION'),
        },
      );
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async getTokens(userId: number): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.config.get<string>('ACCESS_TOKEN_EXPIRATION'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.config.get<string>('REFRESH_TOKEN_EXPIRATION'),
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
