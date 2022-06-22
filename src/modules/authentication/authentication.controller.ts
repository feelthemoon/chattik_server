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
} from '@nestjs/common';
import { GetCurrentUserId, Public } from '../../common/decorators';
import { Request, Response } from 'express';
import { SigninDto, SignupDto } from './authentication.dto';
import { AuthenticationService } from './authentication.service';
import { RtGuard } from '../../common/guards/refreshToken.guard';
import { AtGuard } from '../../common/guards/accessToken.guard';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('api/auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  async signin(@Body() signinDto: SigninDto, @Res() response: Response) {
    const tokens = await this.authenticationService.signin(signinDto);
    response.cookie('refresh_token', tokens.refresh_token);
    response.setHeader('Access-Control-Expose-Headers', 'Authorization');
    response.setHeader('Authorization', `Bearer ${tokens.access_token}`);
    response.send();
  }

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res() response: Response) {
    const tokens = await this.authenticationService.signup(signupDto);
    response.cookie('refresh_token', tokens.refresh_token);
    response.setHeader('Access-Control-Expose-Headers', 'Authorization');
    response.setHeader('Authorization', `Bearer ${tokens.access_token}`);
    response.send();
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(...[RtGuard, AtGuard])
  @Post('logout')
  async logout(
    @GetCurrentUserId() userId: number,
    @Headers('authorization') reqHeaders,
    @Res() response: Response,
  ) {
    await this.authenticationService.logout(userId, reqHeaders);
    response.send();
  }

  @Public()
  @Post('refresh')
  @UseGuards(RtGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @GetCurrentUserId() userId: number,
    @Req() request: Request,
    @Res() response: Response,
  ) {
    const accessToken = await this.authenticationService.refreshToken(
      userId,
      request.cookies['refresh_token'],
    );
    response.send({ type: 'Bearer', token: accessToken });
  }
}
