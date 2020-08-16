import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNumber()
  @IsNotEmpty()
  code: number;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
