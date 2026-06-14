import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../admin/admin-auth.guard';
import { OrderFeedConfigService, type OrderFeedRules } from './order-feed-config.service';

@ApiTags('Admin OrderFeed')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('admin/order-feed')
export class AdminOrderFeedController {
  constructor(private readonly orderFeedConfig: OrderFeedConfigService) {}

  @Get()
  @ApiOperation({ summary: '实时下单动态配置' })
  get() {
    return this.orderFeedConfig.getRules();
  }

  @Put()
  @ApiOperation({ summary: '保存实时下单动态配置' })
  save(@Body() dto: OrderFeedRules) {
    return this.orderFeedConfig.saveRules(dto);
  }
}
