import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';
import { CreateOrderDto, OrderListQueryDto, OrderPreviewDto, PayOrderDto } from './dto';
import { OrderService } from './order.service';

@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('preview')
  @ApiOperation({ summary: '下单试算（贡献金抵扣）' })
  preview(@CurrentUser('sub') userId: string, @Body() dto: OrderPreviewDto) {
    return this.orderService.preview(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: '订单列表' })
  list(@CurrentUser('sub') userId: string, @Query() query: OrderListQueryDto) {
    return this.orderService.list(userId, query);
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateOrderDto) {
    return this.orderService.create(userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '订单详情' })
  detail(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.orderService.detail(userId, id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '发起支付' })
  pay(@CurrentUser('sub') userId: string, @Param('id') id: string, @Body() dto: PayOrderDto) {
    return this.orderService.pay(userId, id, dto);
  }

  @Get(':id/pay-status')
  @ApiOperation({ summary: '支付结果查询' })
  payStatus(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.orderService.payStatus(userId, id);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: '确认收货' })
  receive(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.orderService.receive(userId, id);
  }
}
