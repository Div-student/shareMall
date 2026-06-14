import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from '../../database/entities/admin-user.entity';
import { AftersaleEntity } from '../../database/entities/aftersale.entity';
import { CheckinPlanEntity } from '../../database/entities/checkin-plan.entity';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { FundRecordEntity } from '../../database/entities/fund-record.entity';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';
import { OperationLogEntity } from '../../database/entities/operation-log.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { RoleEntity } from '../../database/entities/role.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { UserKycEntity } from '../../database/entities/user-kyc.entity';
import { WithdrawalEntity } from '../../database/entities/withdrawal.entity';
import { AdminAccountController } from './admin-account.controller';
import { AdminAccountService } from './admin-account.service';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminOperationLogInterceptor } from './admin-operation-log.interceptor';
import { AdminSmsController } from './admin-sms.controller';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { OperationLogController } from './operation-log.controller';
import { OperationLogService } from './operation-log.service';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUserEntity,
      RoleEntity,
      OperationLogEntity,
      OrderEntity,
      UserEntity,
      FundAccountEntity,
      FundRecordEntity,
      CheckinPlanEntity,
      WithdrawalEntity,
      UserKycEntity,
      AftersaleEntity,
      InviteRelationEntity,
    ]),
  ],
  controllers: [
    AdminAuthController,
    DashboardController,
    RoleController,
    AdminAccountController,
    AdminSmsController,
    OperationLogController,
  ],
  providers: [
    AdminAuthService,
    DashboardService,
    RoleService,
    AdminAccountService,
    OperationLogService,
    AdminAuthGuard,
    {
      provide: APP_GUARD,
      useClass: AdminAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminOperationLogInterceptor,
    },
  ],
  exports: [OperationLogService, AdminAuthGuard],
})
export class AdminModule {}
