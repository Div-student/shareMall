import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

  @Get('user/profile')
  @ApiOperation({ summary: '个人信息' })
  profile(@CurrentUser('sub') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put('user/profile')
  @ApiOperation({ summary: '更新个人信息' })
  updateProfile(@Body() _body: unknown) {
    return { success: true };
  }

  @Get('user/address')
  @ApiOperation({ summary: '地址列表' })
  addressList(@CurrentUser('sub') userId: string) {
    return this.addressService.list(userId);
  }

  @Post('user/address')
  @ApiOperation({ summary: '新增收货地址' })
  createAddress(@CurrentUser('sub') userId: string, @Body() dto: CreateAddressDto) {
    return this.addressService.create(userId, dto);
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
    return { withdrawId: 1, status: 'pending' };
  }

  @Get('withdraw/records')
  @ApiOperation({ summary: '提现记录' })
  withdrawRecords() {
    return { list: [], total: 0 };
  }
}
