import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
      kycStatus: user.kycStatus,
      invitedCount,
      fund: {
        pendingFund: account?.pendingFund ?? 0,
        availableFund: account?.availableFund ?? 0,
        withdrawableCash: account?.withdrawableCash ?? 0,
      },
    };
  }

  async getInvite(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');

    const relations = await this.invites.find({
      where: { inviterId: userId },
      order: { id: 'DESC' },
      take: 50,
    });

    const inviteeIds = relations.map((r) => r.inviteeId);
    const invitees =
      inviteeIds.length > 0
        ? await this.users.find({ where: { id: In(inviteeIds) } })
        : [];
    const inviteeMap = new Map(invitees.map((u) => [u.id, u]));

    return {
      inviteCode: user.inviteCode,
      invitedCount: relations.length,
      list: relations.map((r) => {
        const invitee = inviteeMap.get(r.inviteeId);
        return {
          id: Number(r.id),
          phone: this.maskPhone(invitee?.phone ?? ''),
          nickname: invitee?.nickname ?? '',
          createdAt: r.createdAt,
        };
      }),
    };
  }

  private maskPhone(phone: string) {
    if (phone.length !== 11) return phone;
    return `${phone.slice(0, 3)}****${phone.slice(7)}`;
  }
}
