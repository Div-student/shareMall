import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductListQueryDto } from './dto';
import { ProductService } from './product.service';

@ApiTags('Product')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('home')
  @ApiOperation({ summary: '首页聚合' })
  home() {
    return this.productService.getHome();
  }

  @Get('products')
  @ApiOperation({ summary: '商品列表' })
  list(@Query() query: ProductListQueryDto) {
    return this.productService.listProducts(query);
  }

  @Get('products/:id')
  @ApiOperation({ summary: '商品详情' })
  detail(@Param('id') id: string) {
    return this.productService.getProductDetail(id);
  }

  @Get('products/:id/order-feed')
  @ApiOperation({ summary: '实时下单动态（脱敏）' })
  orderFeed(@Param('id') id: string) {
    return this.productService.getOrderFeed(id);
  }
}
