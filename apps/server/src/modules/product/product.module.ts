import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerEntity } from '../../database/entities/banner.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { ProductEntity } from '../../database/entities/product.entity';
import { SkuEntity } from '../../database/entities/sku.entity';
import { AdminProductController } from './admin-product.controller';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity, CategoryEntity, SkuEntity, BannerEntity])],
  controllers: [ProductController, AdminProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
