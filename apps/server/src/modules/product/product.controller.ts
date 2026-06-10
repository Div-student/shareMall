import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Product')
@Controller()
export class ProductController {
  @Get('home')
  @ApiOperation({ summary: '首页聚合' })
  home() {
    return { banners: [], categories: [], products: [] };
  }

  @Get('products')
  @ApiOperation({ summary: '商品列表' })
  list(@Query('page') _page = 1, @Query('keyword') _keyword?: string) {
    return { list: [], total: 0 };
  }

  @Get('products/:id')
  @ApiOperation({ summary: '商品详情' })
  detail(@Param('id') id: string) {
    return { id: Number(id) };
  }

  @Get('products/:id/order-feed')
  @ApiOperation({ summary: '实时下单动态（脱敏）' })
  orderFeed(@Param('id') _id: string) {
    return { list: [] };
  }
}
