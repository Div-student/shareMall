import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/auth/jwt-auth.guard';

@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  @Post('preview')
  @ApiOperation({ summary: '下单试算（贡献金抵扣）' })
  preview(@Body() _body: unknown) {
    // TODO: 计算金额明细、可抵扣上限、预计累计贡献金
    return {
      totalAmount: 0,
      fundDeductMax: 0,
      fundDeductAmount: 0,
      freight: 0,
      payAmount: 0,
      accruedFund: 0,
    };
  }

  @Get()
  @ApiOperation({ summary: '订单列表' })
  list(@Query('status') _status = 'all') {
    return { list: [], total: 0 };
  }

  @Post()
  @ApiOperation({ summary: '创建订单' })
  create(@Body() _body: unknown) {
    // TODO: 校验库存/抵扣，扣减可用贡献金，创建订单
    return { orderNo: 'mock-order-no' };
  }

  @Get(':id')
  @ApiOperation({ summary: '订单详情' })
  detail(@Param('id') id: string) {
    return { id: Number(id) };
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '发起支付' })
  pay(@Param('id') _id: string, @Body() _body: unknown) {
    return { payParams: {} };
  }

  @Post(':id/receive')
  @ApiOperation({ summary: '确认收货' })
  receive(@Param('id') _id: string) {
    return { success: true };
  }
}
