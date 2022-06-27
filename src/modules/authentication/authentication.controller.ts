import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Headers,
  Query,
  UseFilters,
} from '@nestjs/common';
import { GetCurrentUserIdFromRefreshToken, Public } from '../../common/decorators';
import { Request, Response } from 'express';
import { SigninDto, SignupDto } from './authentication.dto';
import { AuthenticationService } from './authentication.service';
import { RtGuard, VerifyTokenGuard } from '../../common/guards';
import { AtGuard } from '../../common/guards';
import { TokenExceptionFilter } from '../../common/filters';
import { HttpExceptionFilter } from '../../common/filters';

@UsePipes(new ValidationPipe({ transform: true }))
@UseFilters(HttpExceptionFilter, TokenExceptionFilter)
@Controller('api/auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() signinDto: SigninDto, @Res() response: Response) {
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
  async signup(@Body() signupDto: SignupDto, @Res() response: Response) {
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
  async recoverPassword(@Body() reqBody: { email: string }, @Res() response: Response) {
    await this.authenticationService.sendUserRecoverPasswordLink(reqBody.email);
    response.send();
  }
}
