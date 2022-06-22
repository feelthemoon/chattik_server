import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AtStrategy, RtStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  providers: [AuthenticationService, AtStrategy, RtStrategy],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
