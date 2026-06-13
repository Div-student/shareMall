import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Not, Repository } from 'typeorm';
import { AftersaleEntity } from '../../database/entities/aftersale.entity';
import { CheckinPlanEntity } from '../../database/entities/checkin-plan.entity';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { FundRecordEntity } from '../../database/entities/fund-record.entity';
import { InviteRelationEntity } from '../../database/entities/invite-relation.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { UserKycEntity } from '../../database/entities/user-kyc.entity';
import { WithdrawalEntity } from '../../database/entities/withdrawal.entity';

const PAID_STATUSES = ['paid', 'shipped', 'received', 'completed'] as const;

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(FundAccountEntity) private readonly accounts: Repository<FundAccountEntity>,
    @InjectRepository(FundRecordEntity) private readonly fundRecords: Repository<FundRecordEntity>,
    @InjectRepository(CheckinPlanEntity) private readonly plans: Repository<CheckinPlanEntity>,
    @InjectRepository(WithdrawalEntity) private readonly withdrawals: Repository<WithdrawalEntity>,
    @InjectRepository(UserKycEntity) private readonly kycs: Repository<UserKycEntity>,
    @InjectRepository(AftersaleEntity) private readonly aftersales: Repository<AftersaleEntity>,
    @InjectRepository(InviteRelationEntity) private readonly invites: Repository<InviteRelationEntity>,
  ) {}

  async overview() {
    const todayStart = this.startOfToday();
    const tomorrowStart = this.addDays(todayStart, 1);

    const [
      gmvRow,
      paidOrderCount,
      totalOrderCount,
      usersTotal,
      usersToday,
      inviteTotal,
      fundSummary,
      deductRow,
      activeCheckinCount,
      pendingWithdrawRow,
      pendingKycCount,
      pendingAftersaleCount,
      trend,
    ] = await Promise.all([
      this.orders
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.pay_amount), 0)', 'gmv')
        .where('o.status IN (:...statuses)', { statuses: PAID_STATUSES })
        .getRawOne<{ gmv: string }>(),
      this.orders.count({ where: { status: In([...PAID_STATUSES]) } }),
      this.orders.count(),
      this.users.count(),
      this.users.count({ where: { createdAt: Between(todayStart, tomorrowStart) } }),
      this.invites.count(),
      this.accounts
        .createQueryBuilder('a')
        .select('COALESCE(SUM(a.pending_fund), 0)', 'pendingFund')
        .addSelect('COALESCE(SUM(a.available_fund), 0)', 'availableFund')
        .addSelect('COALESCE(SUM(a.withdrawable_cash), 0)', 'withdrawableCash')
        .getRawOne<{ pendingFund: string; availableFund: string; withdrawableCash: string }>(),
      this.fundRecords
        .createQueryBuilder('r')
        .select('COALESCE(SUM(ABS(r.amount)), 0)', 'deductTotal')
        .where('r.change_type = :changeType', { changeType: 'order_deduct' })
        .getRawOne<{ deductTotal: string }>(),
      this.plans.count({ where: { status: 'active' } }),
      this.withdrawals
        .createQueryBuilder('w')
        .select('COALESCE(SUM(w.amount), 0)', 'amount')
        .where('w.status IN (:...statuses)', { statuses: ['pending', 'auditing'] })
        .getRawOne<{ amount: string }>(),
      this.kycs.count({ where: { status: 'pending' } }),
      this.aftersales.count({ where: { status: 'pending' } }),
      this.buildTrend(7),
    ]);

    const gmv = Number(gmvRow?.gmv ?? 0);
    const avgOrderAmount =
      paidOrderCount > 0 ? Math.round((gmv / paidOrderCount) * 100) / 100 : 0;
    const paymentSuccessRate =
      totalOrderCount > 0
        ? Math.round((paidOrderCount / totalOrderCount) * 10000) / 100
        : 0;

    return {
      trade: {
        gmv,
        orderCount: paidOrderCount,
        avgOrderAmount,
        paymentSuccessRate,
      },
      user: {
        total: usersTotal,
        todayNew: usersToday,
        inviteTotal,
      },
      fund: {
        pendingTotal: Number(fundSummary?.pendingFund ?? 0),
        availableTotal: Number(fundSummary?.availableFund ?? 0),
        withdrawableTotal: Number(fundSummary?.withdrawableCash ?? 0),
        deductTotal: Number(deductRow?.deductTotal ?? 0),
        activeCheckinUsers: activeCheckinCount,
      },
      audit: {
        pendingWithdrawAmount: Number(pendingWithdrawRow?.amount ?? 0),
        pendingKycCount,
        pendingAftersaleCount,
      },
      trend,
    };
  }

  private async buildTrend(days: number) {
    const result: { date: string; orderCount: number; gmv: number }[] = [];
    const start = this.startOfToday();
    start.setDate(start.getDate() - (days - 1));

    for (let i = 0; i < days; i += 1) {
      const dayStart = this.addDays(start, i);
      const dayEnd = this.addDays(dayStart, 1);
      const date = dayStart.toISOString().slice(0, 10);

      const [orderCount, gmvRow] = await Promise.all([
        this.orders.count({
          where: {
            createdAt: Between(dayStart, dayEnd),
            status: Not('unpaid'),
          },
        }),
        this.orders
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.pay_amount), 0)', 'gmv')
          .where('o.created_at >= :start AND o.created_at < :end', {
            start: dayStart,
            end: dayEnd,
          })
          .andWhere('o.status IN (:...statuses)', { statuses: PAID_STATUSES })
          .getRawOne<{ gmv: string }>(),
      ]);

      result.push({
        date,
        orderCount,
        gmv: Number(gmvRow?.gmv ?? 0),
      });
    }

    return result;
  }

  private startOfToday() {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  }
}
