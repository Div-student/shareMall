import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { AddressService } from './address.service';
import { CreateAddressDto, SubmitKycDto } from './dto';
import { KycService } from './kyc.service';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
    private readonly kycService: KycService,
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

  @Get('user/kyc')
  @ApiOperation({ summary: '实名认证状态' })
  kycStatus(@CurrentUser('sub') userId: string) {
    return this.kycService.getStatus(userId);
  }

  @Post('user/kyc')
  @ApiOperation({ summary: '提交实名认证' })
  submitKyc(@CurrentUser('sub') userId: string, @Body() dto: SubmitKycDto) {
    return this.kycService.submit(userId, dto);
  }

  @Get('user/invite')
  @ApiOperation({ summary: '我的邀请' })
  invite(@CurrentUser('sub') userId: string) {
    return this.userService.getInvite(userId);
  }
}
