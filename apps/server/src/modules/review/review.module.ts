import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderItemEntity } from '../../database/entities/order-item.entity';
import { ProductReviewEntity } from '../../database/entities/product-review.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AdminReviewController } from './admin-review.controller';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductReviewEntity, OrderEntity, OrderItemEntity, UserEntity]),
  ],
  controllers: [ReviewController, AdminReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewModule {}
