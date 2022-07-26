import {
  BadRequestException,
  ForbiddenException,
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
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
  ) {}

  async signin(signDto: SigninDto): Promise<Tokens> {
    const user = await this.usersService.findBy('email', signDto.email, 'password');

    if (!user) {
      throw new BadRequestException({
        message: [{ type: 'invalid_data', text: 'Invalid email or password' }],
      });
    }

    if (!user.confirmed) {
      throw new ForbiddenException({
        message: [{ type: 'common_error', text: 'You have to confirm your profile!' }],
      });
    }
    const isPasswordCompared = await compare(signDto.password, user.password);

    if (!isPasswordCompared) {
      throw new BadRequestException({
        message: [{ type: 'invalid_data', text: 'Invalid email or password' }],
      });
    }
    const tokens = await this.getTokens(user.id);
    const refreshHash = await hash(tokens.refresh_token, 10);
    await this.usersService.updateOne(user.id, 'refresh_hash', refreshHash);

    return tokens;
  }

  async signup(signupDto: SignupDto): Promise<void> {
    const existingErrors = [];

    const isEmailInUse = await this.usersService.findBy('email', signupDto.email);
    if (isEmailInUse)
      existingErrors.push({
        type: 'invalid_data_email',
        text: 'Email already in use',
      });

    const isUsernameInUse = await this.usersService.findBy('username', signupDto.username);
    if (isUsernameInUse)
      existingErrors.push({
        type: 'invalid_data_username',
        text: 'Username already in use',
      });

    if (existingErrors.length) throw new BadRequestException({ message: existingErrors });

    const hashPassword = await hash(signupDto.password, 10);

    const user = await this.usersService.create({
      ...signupDto,
      password: hashPassword,
    });

    const verifyToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.config.get<string>('VERIFY_TOKEN_SECRET'),
        expiresIn: this.config.get<string>('VERIFY_TOKEN_EXPIRATION'),
      },
    );

    await this.mailService.sendEmail({
      name: 'verify.hbs',
      data: {
        to: signupDto.email,
        subject: 'Verify account',
        context: {
          text: 'Confirm your registration by verifying your account',
          link: `${this.config.get<string>('CLIENT_URL')}/confirm?token=${verifyToken}`,
          linkText: 'Verify',
          clientLink: this.config.get<string>('CLIENT_URL'),
        },
      },
    });
    return;
  }

  async logout(userId: number, accessToken: string): Promise<boolean> {
    const redisClient = this.redisService.getClient('revoked_tokens');
    await redisClient.append(accessToken, 'true');

    await this.usersService.updateOne(userId, 'refresh_hash', null);
    return true;
  }

  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findBy('id', userId, 'refresh_hash');
    if (!user.refresh_hash)
      throw new UnauthorizedException({
        message: [{ type: 'common_error', text: 'Unauthorized' }],
      });

    const isRefreshTokensCompared = await compare(refreshToken, user.refresh_hash);
    if (!isRefreshTokensCompared)
      throw new UnauthorizedException({
        message: [{ type: 'common_error', text: 'Unauthorized' }],
      });

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

  async verifyUser(token: string): Promise<void> {
    const redisClient = this.redisService.getClient('revoked_tokens');
    const isTokenRevoked = await redisClient.get(token);
    if (isTokenRevoked) {
      throw new UnauthorizedException({
        message: [{ type: 'common_error', text: 'Unauthorized' }],
      });
    }
    this.jwtService.verify(token, {
      secret: this.config.get<string>('VERIFY_TOKEN_SECRET'),
    });
    const userId = this.jwtService.decode(token).sub;
    const isAlreadyConfirmed = (await this.usersService.findBy('id', userId)).confirmed;
    if (isAlreadyConfirmed) {
      throw new BadRequestException({
        message: [{ type: 'common_error', text: 'You are already confirmed' }],
      });
    }
    await this.usersService.updateConfirmed(userId, true);
  }

  async sendUserRecoverPasswordLink(email: string) {
    const user = await this.usersService.findBy('email', email);
    if (!user) {
      throw new BadRequestException({
        message: [{ type: 'invalid_email', text: 'There are no user with such email' }],
      });
    }
    const recoverToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.config.get<string>('RECOVER_TOKEN_SECRET'),
        expiresIn: this.config.get<string>('RECOVER_TOKEN_EXPIRATION'),
      },
    );
    await this.mailService.sendEmail({
      name: 'recover.hbs',
      data: {
        to: email,
        subject: 'Recover password',
        context: {
          text: 'You received this email because you forgot your password. Please click the link below for create new one.',
          link: `${this.config.get<string>('CLIENT_URL')}/new-password?token=${recoverToken}`,
          linkText: 'Create New Password',
          clientLink: this.config.get<string>('CLIENT_URL'),
        },
      },
    });
  }
}
