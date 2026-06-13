import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigEntity } from '../../database/entities/config.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { WithdrawalEntity } from '../../database/entities/withdrawal.entity';
import { AdminWithdrawController } from './admin-withdraw.controller';
import { WithdrawConfigService } from './withdraw-config.service';
import { WithdrawController } from './withdraw.controller';
import { WithdrawService } from './withdraw.service';

@Module({
  imports: [TypeOrmModule.forFeature([WithdrawalEntity, UserEntity, ConfigEntity])],
  controllers: [WithdrawController, AdminWithdrawController],
  providers: [WithdrawService, WithdrawConfigService],
  exports: [WithdrawService],
})
export class WithdrawModule {}
