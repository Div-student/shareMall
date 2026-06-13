import { Body, Controller, Get, Ip, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { CurrentAdmin } from './current-admin.decorator';
import { AdminLoginDto } from './dto';

@ApiTags('Admin-Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuth: AdminAuthService) {}

  @Post('login')
  @ApiOperation({ summary: '后台登录' })
  login(@Body() dto: AdminLoginDto, @Ip() ip: string) {
    return this.adminAuth.login(dto, ip);
  }

  @Get('profile')
  @ApiOperation({ summary: '当前管理员信息' })
  profile(@CurrentAdmin('sub') adminId: string) {
    return this.adminAuth.profile(adminId);
  }
}
