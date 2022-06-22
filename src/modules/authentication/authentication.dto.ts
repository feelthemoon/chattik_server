import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SigninDto {
  @MaxLength(255)
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  password: string;
}

export class SignupDto extends SigninDto {
  @IsString()
  @MinLength(5)
  @MaxLength(25)
  username: string;
}
