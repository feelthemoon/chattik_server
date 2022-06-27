import { IsString, Matches } from 'class-validator';
import { Match } from '../../../common/decorators';

export class NewUserPasswordDto {
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,255})/)
  newPassword: string;

  @IsString()
  @Match('newPassword')
  passwordConfirm: string;
}
