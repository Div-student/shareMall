import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOrderListQueryDto } from './dto';
import { OrderService } from './order.service';

/** 后台订单管理（M1 暂不做 Admin 鉴权，后续接入 RBAC） */
@ApiTags('Admin-Order')
@Controller('admin/orders')
export class AdminOrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: '订单列表（后台）' })
  list(@Query() query: AdminOrderListQueryDto) {
    return this.orderService.adminList(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '订单详情（后台）' })
  detail(@Param('id') id: string) {
    return this.orderService.adminDetail(id);
  }

  @Post(':id/ship')
  @ApiOperation({ summary: '订单发货' })
  ship(@Param('id') id: string) {
    return this.orderService.adminShip(id);
  }
}
