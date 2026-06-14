import { Body, Controller, Ip, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginSmsDto, RegisterDto, ResetPasswordDto, SendSmsDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sms')
  @ApiOperation({ summary: '发送短信验证码' })
  sendSms(@Body() dto: SendSmsDto) {
    return this.authService.sendSms(dto);
  }

  @Post('register')
  @ApiOperation({ summary: '注册（邀请码 + 短信）' })
  register(@Body() dto: RegisterDto, @Ip() ip: string) {
    return this.authService.register(dto, ip);
  }

  @Post('login')
  @ApiOperation({ summary: '账号密码登录' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('login-sms')
  @ApiOperation({ summary: '短信验证码登录' })
  loginSms(@Body() dto: LoginSmsDto) {
    return this.authService.loginSms(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '重置密码' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
