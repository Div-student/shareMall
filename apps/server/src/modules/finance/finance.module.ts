import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AftersaleEntity } from '../../database/entities/aftersale.entity';
import { FundRecordEntity } from '../../database/entities/fund-record.entity';
import { NftTradeEntity } from '../../database/entities/nft-trade.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { WithdrawalEntity } from '../../database/entities/withdrawal.entity';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentEntity,
      WithdrawalEntity,
      FundRecordEntity,
      NftTradeEntity,
      OrderEntity,
      AftersaleEntity,
      UserEntity,
    ]),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
})
export class FinanceModule {}
