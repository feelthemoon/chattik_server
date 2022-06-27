import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AtStrategy, RtStrategy, VerifyTokenStrategy } from './strategies';

@Module({
  imports: [JwtModule.register({}), UsersModule],
  providers: [AuthenticationService, AtStrategy, RtStrategy, VerifyTokenStrategy],
  controllers: [AuthenticationController],
})
export class AuthenticationModule {}
