import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from '../../entities';
import { RecoverTokenStrategy } from '../authentication/strategies';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [UsersService, RecoverTokenStrategy],
  controllers: [UsersController],
  exports: [UsersService, RecoverTokenStrategy],
})
export class UsersModule {}
