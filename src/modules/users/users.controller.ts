import { Controller, UseGuards } from '@nestjs/common';
import { AtGuard } from '../../common/guards';
import { UsersService } from './users.service';

@UseGuards(AtGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
