import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  Headers,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { GetCurrentUserIdFromRefreshToken, Public } from '../../common/decorators';
import { Request, Response } from 'express';
import { SigninDto, SignupDto } from './authentication.dto';
import { AuthenticationService } from './authentication.service';
import { RtGuard, VerifyTokenGuard } from '../../common/guards';
import { AtGuard } from '../../common/guards';
import { Recaptcha, RecaptchaResult } from '@nestlab/google-recaptcha';
import { GoogleRecaptchaValidationResult } from '@nestlab/google-recaptcha/interfaces/google-recaptcha-validation-result';

@Controller('api/auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  @Recaptcha({ response: (req) => req.body.recaptchaToken, action: 'signin', score: 0.8 })
  async signin(
    @Body() signinDto: SigninDto,
    @RecaptchaResult() recaptchaResult: GoogleRecaptchaValidationResult,
    @Res() response: Response,
  ) {
    if (recaptchaResult.errors.length) {
      throw new BadRequestException({
        message: [{ type: 'common_error', text: 'Recaptcha error' }],
      });
    }
    const tokens = await this.authenticationService.signin(signinDto);
    response.setHeader(
      'Set-Cookie',
      `Refresh=${tokens.refresh_token}; HttpOnly; Path=/; Max-Age=10d`,
    );
    response.setHeader('Access-Control-Expose-Headers', 'Authorization');
    response.setHeader('Authorization', `Bearer ${tokens.access_token}`);
    response.send();
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  @Recaptcha({ response: (req) => req.body.recaptchaToken, action: 'signup', score: 0.8 })
  async signup(
    @Body() signupDto: SignupDto,
    @RecaptchaResult() recaptchaResult: GoogleRecaptchaValidationResult,
    @Res() response: Response,
  ) {
    if (recaptchaResult.errors.length) {
      throw new BadRequestException({
        message: [{ type: 'common_error', text: 'Recaptcha error' }],
      });
    }
    const tokens = await this.authenticationService.signup(signupDto);
    response.setHeader(
      'Set-Cookie',
      `Refresh=${tokens.refresh_token}; HttpOnly; Path=/; Max-Age=10d`,
    );
    response.setHeader('Access-Control-Expose-Headers', 'Authorization');
    response.setHeader('Authorization', `Bearer ${tokens.access_token}`);
    response.send();
  }

  @UseGuards(RtGuard, AtGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @GetCurrentUserIdFromRefreshToken() userId: number,
    @Headers('authorization') reqHeaders,
    @Res() response: Response,
  ) {
    await this.authenticationService.logout(userId, reqHeaders);
    response.send();
  }

  @UseGuards(RtGuard)
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserIdFromRefreshToken() userId: number,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const accessToken = await this.authenticationService.refreshToken(
      userId,
      request.cookies['Refresh'],
    );
    response.send({ type: 'Bearer', token: accessToken });
  }

  @Public()
  @UseGuards(VerifyTokenGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verifyUser(@Query('token') token: string, @Res() response: Response) {
    const user = await this.authenticationService.verifyUser(token);
    response.send(user);
  }

  @Public()
  @Post('recover')
  @HttpCode(HttpStatus.OK)
  @Recaptcha({ response: (req) => req.body.recaptchaToken, action: 'recoverPassword', score: 0.8 })
  async recoverPassword(
    @Body() reqBody: { email: string },
    @RecaptchaResult() recaptchaResult: GoogleRecaptchaValidationResult,
    @Res() response: Response,
  ) {
    if (recaptchaResult.errors.length) {
      throw new BadRequestException({
        message: [{ type: 'common_error', text: 'Recaptcha error' }],
      });
    }
    await this.authenticationService.sendUserRecoverPasswordLink(reqBody.email);
    response.send();
  }
}
