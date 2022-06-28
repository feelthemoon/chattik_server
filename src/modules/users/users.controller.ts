import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Put,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RecoverTokenGuard } from '../../common/guards';
import { NewUserPasswordDto } from './dto/newUserPassword.dto';
import { Response } from 'express';
import { GetCurrentUserIdFromRecoverToken, Public } from '../../common/decorators';
import { AtGuard } from '../../common/guards';

@UseGuards(AtGuard, RecoverTokenGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Put('new-password')
  async updateUserPassword(
    @Body() reqBody: NewUserPasswordDto,
    @GetCurrentUserIdFromRecoverToken() userId: number,
    @Res() response: Response,
  ) {
    await this.usersService.updateOne(userId, 'password', reqBody.newPassword);
    response.send();
  }
}
