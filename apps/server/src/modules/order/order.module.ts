import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from '../../database/entities/address.entity';
import { CartItemEntity } from '../../database/entities/cart-item.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderItemEntity } from '../../database/entities/order-item.entity';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { ProductEntity } from '../../database/entities/product.entity';
import { SkuEntity } from '../../database/entities/sku.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FundModule } from '../fund/fund.module';
import { AdminOrderController } from './admin-order.controller';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { OrderController } from './order.controller';
import { OrderScheduler } from './order.scheduler';
import { OrderService } from './order.service';

@Module({
  imports: [
    FundModule,
    TypeOrmModule.forFeature([
      CartItemEntity,
      OrderEntity,
      OrderItemEntity,
      PaymentEntity,
      AddressEntity,
      ProductEntity,
      SkuEntity,
      CategoryEntity,
      FundAccountEntity,
      UserEntity,
    ]),
  ],
  controllers: [OrderController, CartController, AdminOrderController],
  providers: [OrderService, CartService, OrderScheduler],
  exports: [OrderService],
})
export class OrderModule {}
