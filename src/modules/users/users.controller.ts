import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RecoverTokenGuard } from '../../common/guards';
import { NewUserPasswordDto } from './dto';
import { Response } from 'express';
import { GetCurrentUserIdFromRecoverToken, Public } from '../../common/decorators';
import { AtGuard } from '../../common/guards';
import { Recaptcha, RecaptchaResult } from '@nestlab/google-recaptcha';
import { GoogleRecaptchaValidationResult } from '@nestlab/google-recaptcha/interfaces/google-recaptcha-validation-result';

@UseGuards(AtGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(RecoverTokenGuard)
  @Public()
  @HttpCode(HttpStatus.OK)
  @Put('new-password')
  @Recaptcha({ response: (req) => req.body.recaptchaToken, action: 'newPassword', score: 0.8 })
  async updateUserPassword(
    @Body() reqBody: NewUserPasswordDto,
    @RecaptchaResult() recaptchaResult: GoogleRecaptchaValidationResult,
    @GetCurrentUserIdFromRecoverToken() userId: number,
    @Res() response: Response,
  ) {
    if (recaptchaResult?.errors.length) {
      throw new BadRequestException({
        message: [{ type: 'common_error', text: 'Recaptcha error' }],
      });
    }
    await this.usersService.updateOne(userId, 'password', reqBody.newPassword);
    response.send();
  }

  @HttpCode(HttpStatus.OK)
  @Get('search')
  async searchUsers(@Query('s') username: string, @Res() response: Response) {
    const users = await this.usersService.findAllBy('username', username);
    response.send(users);
  }
}
