import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';
import { UserEntity } from '../../database/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(FundAccountEntity) private readonly fundAccounts: Repository<FundAccountEntity>,
    @InjectRepository(InviteRelationEntity) private readonly invites: Repository<InviteRelationEntity>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) return { id: 0 };

    const [account, invitedCount] = await Promise.all([
      this.fundAccounts.findOne({ where: { userId } }),
      this.invites.count({ where: { inviterId: userId } }),
    ]);

    return {
      id: Number(user.id),
      phone: user.phone,
      nickname: user.nickname ?? '',
      avatar: user.avatar ?? '',
      inviteCode: user.inviteCode,
      invitedCount,
      fund: {
        pendingFund: account?.pendingFund ?? 0,
        availableFund: account?.availableFund ?? 0,
        withdrawableCash: account?.withdrawableCash ?? 0,
      },
    };
  }
}
