import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerEntity } from '../../database/entities/banner.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { ConfigEntity } from '../../database/entities/config.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderItemEntity } from '../../database/entities/order-item.entity';
import { ProductEntity } from '../../database/entities/product.entity';
import { SkuEntity } from '../../database/entities/sku.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AdminOrderFeedController } from './admin-order-feed.controller';
import { AdminProductController } from './admin-product.controller';
import { OrderFeedConfigService } from './order-feed-config.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      CategoryEntity,
      SkuEntity,
      BannerEntity,
      ConfigEntity,
      OrderItemEntity,
      OrderEntity,
      UserEntity,
    ]),
  ],
  controllers: [ProductController, AdminProductController, AdminOrderFeedController],
  providers: [ProductService, OrderFeedConfigService],
  exports: [ProductService],
})
export class ProductModule {}
