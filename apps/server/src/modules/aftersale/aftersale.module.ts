import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AftersaleEntity } from '../../database/entities/aftersale.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FundModule } from '../fund/fund.module';
import { AdminAftersaleController } from './admin-aftersale.controller';
import { AftersaleController } from './aftersale.controller';
import { AftersaleService } from './aftersale.service';

@Module({
  imports: [
    FundModule,
    TypeOrmModule.forFeature([AftersaleEntity, OrderEntity, UserEntity]),
  ],
  controllers: [AftersaleController, AdminAftersaleController],
  providers: [AftersaleService],
})
export class AftersaleModule {}
