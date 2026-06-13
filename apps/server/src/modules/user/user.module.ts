import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from '../../database/entities/address.entity';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AddressService } from './address.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, FundAccountEntity, InviteRelationEntity, AddressEntity]),
  ],
  controllers: [UserController],
  providers: [UserService, AddressService],
  exports: [AddressService],
})
export class UserModule {}
