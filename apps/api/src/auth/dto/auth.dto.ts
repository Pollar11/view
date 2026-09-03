import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  @Transform(({ value }) => String(value ?? '').trim().toLowerCase())
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @Matches(/[a-z]/i, { message: 'Password must contain a letter.' })
  @Matches(/\d/, { message: 'Password must contain a number.' })
  password!: string;

  @IsString()
  @Length(2, 40)
  @Transform(({ value }) => String(value ?? '').trim())
  displayName!: string;
}

export class LoginDto {
  @IsEmail()
  @Transform(({ value }) => String(value ?? '').trim().toLowerCase())
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class RefreshDto {
  @IsString()
  @MinLength(10)
  refreshToken!: string;
}
