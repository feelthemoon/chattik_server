import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class SigninDto {
  @MaxLength(255)
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,255})/)
  password: string;
}

export class SignupDto extends SigninDto {
  @IsString()
  @MinLength(5)
  @MaxLength(25)
  username: string;
}
