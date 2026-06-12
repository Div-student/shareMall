import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigEntity } from '../../database/entities/config.entity';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { CheckinPlanEntity } from '../../database/entities/checkin-plan.entity';
import { CheckinRecordEntity } from '../../database/entities/checkin-record.entity';
import { FundRecordEntity } from '../../database/entities/fund-record.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AdminFundController, FundController } from './fund.controller';
import { FundConfigService } from './fund-config.service';
import { FundService } from './fund.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfigEntity,
      FundAccountEntity,
      FundRecordEntity,
      CheckinPlanEntity,
      CheckinRecordEntity,
      UserEntity,
    ]),
  ],
  controllers: [FundController, AdminFundController],
  providers: [FundConfigService, FundService],
  exports: [FundService, FundConfigService],
})
export class FundModule {}
