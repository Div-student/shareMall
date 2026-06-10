import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from '../../database/entities/user.entity';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, FundAccountEntity, InviteRelationEntity])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
