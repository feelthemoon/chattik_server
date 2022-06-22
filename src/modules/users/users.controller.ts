import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { GetCurrentUserId } from '../../common/decorators';
import { AtGuard } from '../../common/guards/accessToken.guard';
import { Response } from 'express';
import { UsersService } from './users.service';

@UseGuards(AtGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  async getUser(@GetCurrentUserId() userId, @Res() response: Response) {
    const user = await this.usersService.findBy('id', userId);
    response.send(user);
  }
}
