import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class UserController {
  @Get('user/profile')
  @ApiOperation({ summary: '个人信息' })
  profile() {
    return { id: 1 };
  }

  @Put('user/profile')
  @ApiOperation({ summary: '更新个人信息' })
  updateProfile(@Body() _body: unknown) {
    return { success: true };
  }

  @Get('user/address')
  @ApiOperation({ summary: '地址列表' })
  addressList() {
    return { list: [] };
  }

  @Get('user/invite')
  @ApiOperation({ summary: '我的邀请' })
  invite() {
    return { inviteCode: '', invitedCount: 0, list: [] };
  }

  @Get('withdraw/config')
  @ApiOperation({ summary: '提现规则' })
  withdrawConfig() {
    return { min: 0, max: 0, fee: 0, methods: ['bank', 'wechat', 'alipay'] };
  }

  @Post('withdraw')
  @ApiOperation({ summary: '申请提现（提现金）' })
  withdraw(@Body() _body: unknown) {
    // TODO: 校验提现金余额与实名，冻结并受理
    return { withdrawId: 1, status: 'pending' };
  }

  @Get('withdraw/records')
  @ApiOperation({ summary: '提现记录' })
  withdrawRecords() {
    return { list: [], total: 0 };
  }
}
