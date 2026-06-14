import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AdminCreateCategoryDto,
  AdminUpdateCategoryDto,
  AdminCreateProductDto,
  AdminProductListQueryDto,
  AdminUpdateProductDto,
} from './dto';
import { ProductService } from './product.service';

/** 后台商品管理（M1 暂不做 Admin 鉴权，后续接入 RBAC） */
@ApiTags('Admin-Product')
@Controller('admin')
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('products')
  @ApiOperation({ summary: '商品列表（后台）' })
  list(@Query() query: AdminProductListQueryDto) {
    return this.productService.adminListProducts(query);
  }

  @Get('products/:id')
  @ApiOperation({ summary: '商品详情（后台）' })
  detail(@Param('id') id: string) {
    return this.productService.adminGetProduct(id);
  }

  @Post('products')
  @ApiOperation({ summary: '新增商品' })
  create(@Body() dto: AdminCreateProductDto) {
    return this.productService.adminCreateProduct(dto);
  }

  @Put('products/:id')
  @ApiOperation({ summary: '更新商品' })
  update(@Param('id') id: string, @Body() dto: AdminUpdateProductDto) {
    return this.productService.adminUpdateProduct(id, dto);
  }

  @Get('categories')
  @ApiOperation({ summary: '分类列表（后台）' })
  categories() {
    return this.productService.adminListCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: '新增分类' })
  createCategory(@Body() dto: AdminCreateCategoryDto) {
    return this.productService.adminCreateCategory(dto);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: '更新分类' })
  updateCategory(@Param('id') id: string, @Body() dto: AdminUpdateCategoryDto) {
    return this.productService.adminUpdateCategory(id, dto);
  }
}
