import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { CampaignService } from './campaign.service';
import { CouponService } from './coupon.service';
import { DictService } from './dict.service';
import {
  AdminCampaignSaveDto,
  AdminCouponSaveDto,
  AdminDictListQueryDto,
  AdminDictSaveDto,
  AdminListQueryDto,
  ServiceConfigSaveDto,
} from './dto';
import { ServiceConfigService } from './service-config.service';

@ApiTags('Coupon')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get('claimable')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '可领取优惠券' })
  claimable(@CurrentUser('sub') userId: string) {
    return this.couponService.listClaimable(userId);
  }

  @Get('mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '我的优惠券' })
  mine(@CurrentUser('sub') userId: string) {
    return this.couponService.listMine(userId);
  }

  @Post(':id/claim')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '领取优惠券' })
  claim(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.couponService.claim(userId, id);
  }
}

@ApiTags('Campaign')
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  @ApiOperation({ summary: '活动列表' })
  list() {
    return this.campaignService.listActive();
  }

  @Get(':id')
  @ApiOperation({ summary: '活动详情' })
  detail(@Param('id') id: string) {
    return this.campaignService.detail(id);
  }
}

@ApiTags('Dict')
@Controller('dicts')
export class DictController {
  constructor(private readonly dictService: DictService) {}

  @Get(':group')
  @ApiOperation({ summary: '按分组获取字典' })
  list(@Param('group') group: string) {
    return this.dictService.listByGroup(group);
  }
}

@ApiTags('Service')
@Controller('service-config')
export class ServiceConfigController {
  constructor(private readonly serviceConfig: ServiceConfigService) {}

  @Get()
  @ApiOperation({ summary: '客服配置（公开）' })
  get() {
    return this.serviceConfig.getConfig();
  }
}

@ApiTags('Admin Coupon')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/coupons')
export class AdminCouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get()
  list(@Query() query: AdminListQueryDto) {
    return this.couponService.adminList(query);
  }

  @Post()
  create(@Body() dto: AdminCouponSaveDto) {
    return this.couponService.adminCreate(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: AdminCouponSaveDto) {
    return this.couponService.adminUpdate(id, dto);
  }

  @Post(':id/status')
  toggle(@Param('id') id: string, @Body('status') status: 'enabled' | 'disabled') {
    return this.couponService.adminToggle(id, status);
  }
}

@ApiTags('Admin Campaign')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/campaigns')
export class AdminCampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  list(@Query() query: AdminListQueryDto) {
    return this.campaignService.adminList(query);
  }

  @Post()
  create(@Body() dto: AdminCampaignSaveDto) {
    return this.campaignService.adminCreate(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: AdminCampaignSaveDto) {
    return this.campaignService.adminUpdate(id, dto);
  }

  @Post(':id/status')
  setStatus(@Param('id') id: string, @Body('status') status: 'draft' | 'active' | 'ended') {
    return this.campaignService.adminSetStatus(id, status);
  }
}

@ApiTags('Admin Dict')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/dicts')
export class AdminDictController {
  constructor(private readonly dictService: DictService) {}

  @Get('groups')
  groups() {
    return this.dictService.listGroups();
  }

  @Get()
  list(@Query() query: AdminDictListQueryDto) {
    return this.dictService.adminList(query);
  }

  @Post()
  create(@Body() dto: AdminDictSaveDto) {
    return this.dictService.adminCreate(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: AdminDictSaveDto) {
    return this.dictService.adminUpdate(id, dto);
  }

  @Post(':id/delete')
  remove(@Param('id') id: string) {
    return this.dictService.adminDelete(id);
  }
}

@ApiTags('Admin Service')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/service-config')
export class AdminServiceConfigController {
  constructor(private readonly serviceConfig: ServiceConfigService) {}

  @Get()
  get() {
    return this.serviceConfig.getConfig();
  }

  @Put()
  save(@Body() dto: ServiceConfigSaveDto) {
    return this.serviceConfig.saveConfig(dto);
  }
}
