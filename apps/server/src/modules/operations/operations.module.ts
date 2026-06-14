import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignEntity } from '../../database/entities/campaign.entity';
import { ConfigEntity } from '../../database/entities/config.entity';
import { CouponEntity } from '../../database/entities/coupon.entity';
import { DictEntity } from '../../database/entities/dict.entity';
import { UserCouponEntity } from '../../database/entities/user-coupon.entity';
import { CampaignService } from './campaign.service';
import { CouponService } from './coupon.service';
import { DictService } from './dict.service';
import {
  AdminCampaignController,
  AdminCouponController,
  AdminDictController,
  AdminServiceConfigController,
  CampaignController,
  CouponController,
  DictController,
  ServiceConfigController,
} from './operations.controller';
import { ServiceConfigService } from './service-config.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CouponEntity,
      UserCouponEntity,
      CampaignEntity,
      DictEntity,
      ConfigEntity,
    ]),
  ],
  controllers: [
    CouponController,
    CampaignController,
    DictController,
    ServiceConfigController,
    AdminCouponController,
    AdminCampaignController,
    AdminDictController,
    AdminServiceConfigController,
  ],
  providers: [CouponService, CampaignService, DictService, ServiceConfigService],
  exports: [CouponService],
})
export class OperationsModule {}
