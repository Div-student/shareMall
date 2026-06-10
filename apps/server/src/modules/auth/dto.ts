import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class SendSmsDto {
  @ApiProperty({ example: '13800138000' })
  @IsString()
  @Length(11, 11)
  phone!: string;

  @ApiProperty({ enum: ['register', 'login', 'reset'] })
  @IsEnum(['register', 'login', 'reset'] as const)
  scene!: 'register' | 'login' | 'reset';

  @ApiPropertyOptional({ description: '图形验证码/滑块票据' })
  @IsOptional()
  @IsString()
  captcha?: string;
}

export class RegisterDto {
  @ApiProperty({ example: '13800138000' })
  @IsString()
  @Length(11, 11)
  phone!: string;

  @ApiProperty()
  @IsString()
  smsCode!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ description: '邀请码' })
  @IsOptional()
  @IsString()
  inviteCode?: string;
}

export class LoginDto {
  @ApiProperty({ example: '13800138000' })
  @IsString()
  phone!: string;

  @ApiProperty()
  @IsString()
  password!: string;
}

export class LoginSmsDto {
  @ApiProperty({ example: '13800138000' })
  @IsString()
  phone!: string;

  @ApiProperty()
  @IsString()
  smsCode!: string;
}
