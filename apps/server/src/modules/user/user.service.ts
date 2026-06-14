import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { AdminUserListQueryDto, UpdateProfileDto } from './dto';

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
      gender: user.gender,
      birthday: user.birthday ?? null,
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

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (dto.nickname != null) user.nickname = dto.nickname;
    if (dto.avatar != null) user.avatar = dto.avatar;
    if (dto.gender != null) user.gender = dto.gender;
    if (dto.birthday != null) user.birthday = dto.birthday;
    await this.users.save(user);
    return this.getProfile(userId);
  }

  async adminListUsers(query: AdminUserListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = query.keyword
      ? [{ phone: Like(`%${query.keyword}%`) }, { nickname: Like(`%${query.keyword}%`) }]
      : {};

    const [rows, total] = await this.users.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const userIds = rows.map((u) => u.id);
    const accounts = userIds.length
      ? await this.fundAccounts.find({ where: { userId: In(userIds) } })
      : [];
    const accountMap = new Map(accounts.map((a) => [a.userId, a]));

    return {
      list: rows.map((user) => {
        const account = accountMap.get(user.id);
        return {
          id: Number(user.id),
          phone: user.phone,
          nickname: user.nickname ?? '',
          kycStatus: user.kycStatus,
          status: user.status,
          inviteCode: user.inviteCode,
          availableFund: account?.availableFund ?? 0,
          withdrawableCash: account?.withdrawableCash ?? 0,
          createdAt: user.createdAt,
        };
      }),
      total,
      page,
      pageSize,
    };
  }

  async adminGetUser(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');

    const [account, invitedCount, inviter] = await Promise.all([
      this.fundAccounts.findOne({ where: { userId: id } }),
      this.invites.count({ where: { inviterId: id } }),
      user.inviterId ? this.users.findOne({ where: { id: user.inviterId } }) : null,
    ]);

    return {
      id: Number(user.id),
      phone: user.phone,
      nickname: user.nickname ?? '',
      avatar: user.avatar ?? '',
      gender: user.gender,
      birthday: user.birthday ?? null,
      kycStatus: user.kycStatus,
      status: user.status,
      inviteCode: user.inviteCode,
      inviterPhone: inviter ? this.maskPhone(inviter.phone) : null,
      invitedCount,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? null,
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
