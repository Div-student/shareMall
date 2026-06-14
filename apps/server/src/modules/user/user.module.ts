import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from '../../database/entities/address.entity';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';
import { UserKycEntity } from '../../database/entities/user-kyc.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AdminKycController } from './admin-kyc.controller';
import { AdminUserController } from './admin-user.controller';
import { AddressService } from './address.service';
import { KycService } from './kyc.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      FundAccountEntity,
      InviteRelationEntity,
      AddressEntity,
      UserKycEntity,
    ]),
  ],
  controllers: [UserController, AdminKycController, AdminUserController],
  providers: [UserService, AddressService, KycService],
  exports: [UserService, AddressService, KycService],
})
export class UserModule {}
