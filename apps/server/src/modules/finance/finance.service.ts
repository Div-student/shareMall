import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AftersaleEntity } from '../../database/entities/aftersale.entity';
import { FundRecordEntity } from '../../database/entities/fund-record.entity';
import { NftTradeEntity } from '../../database/entities/nft-trade.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { WithdrawalEntity } from '../../database/entities/withdrawal.entity';
import { FinanceFlowQueryDto, FinanceReconcileQueryDto, FinanceReportQueryDto } from './dto';

const PAID_ORDER_STATUSES = ['paid', 'shipped', 'received', 'completed'] as const;

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(PaymentEntity) private readonly payments: Repository<PaymentEntity>,
    @InjectRepository(WithdrawalEntity) private readonly withdrawals: Repository<WithdrawalEntity>,
    @InjectRepository(FundRecordEntity) private readonly fundRecords: Repository<FundRecordEntity>,
    @InjectRepository(NftTradeEntity) private readonly nftTrades: Repository<NftTradeEntity>,
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(AftersaleEntity) private readonly aftersales: Repository<AftersaleEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async flow(query: FinanceFlowQueryDto) {
    const category = query.category ?? 'fund';
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const range = this.resolveDateRange(query.startDate, query.endDate);

    if (category === 'payment') return this.flowPayments(range, page, pageSize);
    if (category === 'withdraw') return this.flowWithdrawals(range, page, pageSize, query.userId);
    if (category === 'nft') return this.flowNftTrades(range, page, pageSize);
    return this.flowFundRecords(range, page, pageSize, query.userId);
  }

  async reports(query: FinanceReportQueryDto) {
    const type = query.type ?? 'trade';
    const range = this.resolveDateRange(query.startDate, query.endDate);

    if (type === 'fund') return this.reportFund(range);
    if (type === 'withdraw') return this.reportWithdraw(range);
    if (type === 'nft') return this.reportNft(range);
    return this.reportTrade(range);
  }

  async reconcile(query: FinanceReconcileQueryDto) {
    const range = this.resolveDateRange(query.startDate, query.endDate);

    const [
      paymentTotalRow,
      orderPayTotalRow,
      paidWithdrawRow,
      fundWithdrawRow,
      accrueRow,
      orderAccrueRow,
      refundRow,
    ] = await Promise.all([
      this.payments
        .createQueryBuilder('p')
        .select('COALESCE(SUM(p.amount), 0)', 'total')
        .where('p.status = :status', { status: 'success' })
        .andWhere('p.created_at >= :start AND p.created_at < :end', range)
        .getRawOne<{ total: string }>(),
      this.orders
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.pay_amount), 0)', 'total')
        .where('o.status IN (:...statuses)', { statuses: PAID_ORDER_STATUSES })
        .andWhere('o.paid_at >= :start AND o.paid_at < :end', range)
        .getRawOne<{ total: string }>(),
      this.withdrawals
        .createQueryBuilder('w')
        .select('COALESCE(SUM(w.actual_amount), 0)', 'total')
        .where('w.status = :status', { status: 'paid' })
        .andWhere('w.paid_at >= :start AND w.paid_at < :end', range)
        .getRawOne<{ total: string }>(),
      this.fundRecords
        .createQueryBuilder('r')
        .select('COALESCE(SUM(ABS(r.amount)), 0)', 'total')
        .where('r.change_type = :changeType', { changeType: 'withdraw' })
        .andWhere('r.asset_type = :assetType', { assetType: 'withdrawable_cash' })
        .andWhere('r.created_at >= :start AND r.created_at < :end', range)
        .getRawOne<{ total: string }>(),
      this.fundRecords
        .createQueryBuilder('r')
        .select('COALESCE(SUM(r.amount), 0)', 'total')
        .where('r.change_type = :changeType', { changeType: 'order_accrue' })
        .andWhere('r.created_at >= :start AND r.created_at < :end', range)
        .getRawOne<{ total: string }>(),
      this.orders
        .createQueryBuilder('o')
        .select('COALESCE(SUM(o.accrued_fund), 0)', 'total')
        .where('o.status IN (:...statuses)', { statuses: ['received', 'completed'] })
        .andWhere('o.received_at >= :start AND o.received_at < :end', range)
        .getRawOne<{ total: string }>(),
      this.aftersales
        .createQueryBuilder('a')
        .select('COALESCE(SUM(a.refund_amount), 0)', 'total')
        .where('a.status = :status', { status: 'refunded' })
        .andWhere('a.updated_at >= :start AND a.updated_at < :end', range)
        .getRawOne<{ total: string }>(),
    ]);

    const paymentTotal = Number(paymentTotalRow?.total ?? 0);
    const orderPayTotal = Number(orderPayTotalRow?.total ?? 0);
    const paidWithdrawTotal = Number(paidWithdrawRow?.total ?? 0);
    const fundWithdrawTotal = Number(fundWithdrawRow?.total ?? 0);
    const accrueTotal = Number(accrueRow?.total ?? 0);
    const orderAccrueTotal = Number(orderAccrueRow?.total ?? 0);
    const refundTotal = Number(refundRow?.total ?? 0);

    return {
      period: {
        startDate: query.startDate ?? this.formatDate(range.start),
        endDate: query.endDate ?? this.formatDate(this.addDays(range.end, -1)),
      },
      items: [
        this.buildReconcileItem(
          'payment',
          '支付对账',
          '成功支付流水 vs 已支付订单实付',
          paymentTotal,
          orderPayTotal,
        ),
        this.buildReconcileItem(
          'withdraw',
          '提现对账',
          '已打款提现 vs 提现金流水',
          paidWithdrawTotal,
          fundWithdrawTotal,
        ),
        this.buildReconcileItem(
          'fund_accrue',
          '贡献金发放对账',
          '确认收货流水 vs 订单累计贡献金',
          accrueTotal,
          orderAccrueTotal,
        ),
        {
          key: 'refund',
          title: '退款汇总',
          description: '已退款售后金额（渠道退款 Mock）',
          platformAmount: refundTotal,
          referenceAmount: refundTotal,
          diff: 0,
          status: 'matched' as const,
        },
      ],
    };
  }

  private async flowPayments(range: { start: Date; end: Date }, page: number, pageSize: number) {
    const qb = this.payments
      .createQueryBuilder('p')
      .where('p.created_at >= :start AND p.created_at < :end', range)
      .orderBy('p.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    const [rows, total] = await qb.getManyAndCount();

    const orderIds = [...new Set(rows.map((item) => item.orderId))];
    const orders = orderIds.length
      ? await this.orders.find({ where: { id: In(orderIds) } })
      : [];
    const orderMap = new Map(orders.map((item) => [item.id, item]));

    return {
      category: 'payment' as const,
      list: rows.map((item) => ({
        id: Number(item.id),
        orderId: Number(item.orderId),
        orderNo: orderMap.get(item.orderId)?.orderNo ?? '',
        channel: item.channel,
        tradeNo: item.tradeNo ?? '',
        amount: item.amount,
        status: item.status,
        createdAt: item.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  private async flowWithdrawals(
    range: { start: Date; end: Date },
    page: number,
    pageSize: number,
    userId?: string,
  ) {
    const qb = this.withdrawals
      .createQueryBuilder('w')
      .where('w.created_at >= :start AND w.created_at < :end', range)
      .orderBy('w.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    if (userId) qb.andWhere('w.user_id = :userId', { userId });
    const [rows, total] = await qb.getManyAndCount();

    const userMap = await this.loadUserPhoneMap(rows.map((item) => item.userId));

    return {
      category: 'withdraw' as const,
      list: rows.map((item) => ({
        id: Number(item.id),
        userId: Number(item.userId),
        userPhone: userMap.get(item.userId) ?? '',
        amount: item.amount,
        fee: item.fee,
        actualAmount: item.actualAmount,
        method: item.method,
        status: item.status,
        paidAt: item.paidAt ?? null,
        createdAt: item.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  private async flowFundRecords(
    range: { start: Date; end: Date },
    page: number,
    pageSize: number,
    userId?: string,
  ) {
    const qb = this.fundRecords
      .createQueryBuilder('r')
      .where('r.created_at >= :start AND r.created_at < :end', range)
      .orderBy('r.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (userId) qb.andWhere('r.user_id = :userId', { userId });

    const [rows, total] = await qb.getManyAndCount();
    const userMap = await this.loadUserPhoneMap(rows.map((item) => item.userId));

    return {
      category: 'fund' as const,
      list: rows.map((item) => ({
        id: Number(item.id),
        userId: Number(item.userId),
        userPhone: userMap.get(item.userId) ?? '',
        assetType: item.assetType,
        changeType: item.changeType,
        amount: item.amount,
        balanceAfter: item.balanceAfter,
        refType: item.refType ?? null,
        refId: item.refId ? Number(item.refId) : null,
        remark: item.remark ?? '',
        createdAt: item.createdAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  private async flowNftTrades(range: { start: Date; end: Date }, page: number, pageSize: number) {
    const qb = this.nftTrades
      .createQueryBuilder('t')
      .where('t.traded_at >= :start AND t.traded_at < :end', range)
      .orderBy('t.traded_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);
    const [rows, total] = await qb.getManyAndCount();

    const userIds = [...new Set(rows.flatMap((item) => [item.buyerId, item.sellerId]))];
    const userMap = await this.loadUserPhoneMap(userIds);

    return {
      category: 'nft' as const,
      list: rows.map((item) => ({
        id: Number(item.id),
        listingId: Number(item.listingId),
        buyerId: Number(item.buyerId),
        buyerPhone: userMap.get(item.buyerId) ?? '',
        sellerId: Number(item.sellerId),
        sellerPhone: userMap.get(item.sellerId) ?? '',
        price: item.price,
        referencePrice: item.referencePrice ?? null,
        fee: item.fee,
        sellerIncome: item.sellerIncome,
        tradedAt: item.tradedAt,
      })),
      total,
      page,
      pageSize,
    };
  }

  private async reportTrade(range: { start: Date; end: Date }) {
    const [summaryRow, refundRow, daily] = await Promise.all([
      this.orders
        .createQueryBuilder('o')
        .select('COUNT(*)', 'orderCount')
        .addSelect('COALESCE(SUM(o.pay_amount), 0)', 'gmv')
        .addSelect('COALESCE(SUM(o.fund_deduct_amount), 0)', 'fundDeduct')
        .where('o.status IN (:...statuses)', { statuses: PAID_ORDER_STATUSES })
        .andWhere('o.paid_at >= :start AND o.paid_at < :end', range)
        .getRawOne<{ orderCount: string; gmv: string; fundDeduct: string }>(),
      this.aftersales
        .createQueryBuilder('a')
        .select('COUNT(*)', 'refundCount')
        .addSelect('COALESCE(SUM(a.refund_amount), 0)', 'refundAmount')
        .where('a.status = :status', { status: 'refunded' })
        .andWhere('a.updated_at >= :start AND a.updated_at < :end', range)
        .getRawOne<{ refundCount: string; refundAmount: string }>(),
      this.buildDailyTrade(range),
    ]);

    const orderCount = Number(summaryRow?.orderCount ?? 0);
    const gmv = Number(summaryRow?.gmv ?? 0);
    const fundDeduct = Number(summaryRow?.fundDeduct ?? 0);
    const refundCount = Number(refundRow?.refundCount ?? 0);
    const refundAmount = Number(refundRow?.refundAmount ?? 0);

    return {
      type: 'trade' as const,
      period: this.periodVo(range, undefined, undefined),
      summary: {
        orderCount,
        gmv,
        avgOrderAmount: orderCount > 0 ? this.round(gmv / orderCount) : 0,
        fundDeduct,
        refundCount,
        refundAmount,
        netGmv: this.round(gmv - refundAmount),
      },
      daily,
    };
  }

  private async reportFund(range: { start: Date; end: Date }) {
    const rows = await this.fundRecords
      .createQueryBuilder('r')
      .select('r.change_type', 'changeType')
      .addSelect('COALESCE(SUM(r.amount), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('r.created_at >= :start AND r.created_at < :end', range)
      .groupBy('r.change_type')
      .getRawMany<{ changeType: string; total: string; count: string }>();

    const byType = Object.fromEntries(
      rows.map((item) => [item.changeType, { total: Number(item.total), count: Number(item.count) }]),
    );

    const summary = {
      orderAccrue: byType.order_accrue?.total ?? 0,
      checkinCashout: byType.checkin_cashout?.total ?? 0,
      orderDeduct: Math.abs(byType.order_deduct?.total ?? 0),
      taskReward: byType.task_reward?.total ?? 0,
      aftersaleVoid: Math.abs(byType.aftersale_void?.total ?? 0),
      aftersaleRollback: byType.aftersale_rollback?.total ?? 0,
      nftExchange: Math.abs(byType.nft_exchange?.total ?? 0),
      nftTradeBuy: Math.abs(byType.nft_trade_buy?.total ?? 0),
    };

    return {
      type: 'fund' as const,
      period: this.periodVo(range, undefined, undefined),
      summary,
      daily: await this.buildDailyFund(range),
    };
  }

  private async reportWithdraw(range: { start: Date; end: Date }) {
    const rows = await this.withdrawals
      .createQueryBuilder('w')
      .select('w.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(w.amount), 0)', 'amount')
      .addSelect('COALESCE(SUM(w.fee), 0)', 'fee')
      .addSelect('COALESCE(SUM(w.actual_amount), 0)', 'actualAmount')
      .where('w.created_at >= :start AND w.created_at < :end', range)
      .groupBy('w.status')
      .getRawMany<{ status: string; count: string; amount: string; fee: string; actualAmount: string }>();

    const byStatus = Object.fromEntries(
      rows.map((item) => [
        item.status,
        {
          count: Number(item.count),
          amount: Number(item.amount),
          fee: Number(item.fee),
          actualAmount: Number(item.actualAmount),
        },
      ]),
    );

    const paid = byStatus.paid ?? { count: 0, amount: 0, fee: 0, actualAmount: 0 };
    const pendingStatuses = ['pending', 'auditing', 'approved', 'paying'];
    const pending = pendingStatuses.reduce(
      (acc, status) => {
        const item = byStatus[status];
        if (!item) return acc;
        return {
          count: acc.count + item.count,
          amount: acc.amount + item.amount,
        };
      },
      { count: 0, amount: 0 },
    );

    return {
      type: 'withdraw' as const,
      period: this.periodVo(range, undefined, undefined),
      summary: {
        applyCount: rows.reduce((sum, item) => sum + Number(item.count), 0),
        applyAmount: rows.reduce((sum, item) => sum + Number(item.amount), 0),
        paidCount: paid.count,
        paidAmount: paid.actualAmount,
        pendingCount: pending.count,
        pendingAmount: pending.amount,
        rejectedCount: byStatus.rejected?.count ?? 0,
        feeTotal: rows.reduce((sum, item) => sum + Number(item.fee), 0),
      },
      daily: await this.buildDailyWithdraw(range),
    };
  }

  private async reportNft(range: { start: Date; end: Date }) {
    const summaryRow = await this.nftTrades
      .createQueryBuilder('t')
      .select('COUNT(*)', 'tradeCount')
      .addSelect('COALESCE(SUM(t.price), 0)', 'tradeVolume')
      .addSelect('COALESCE(SUM(t.fee), 0)', 'feeIncome')
      .addSelect('COALESCE(SUM(t.seller_income), 0)', 'sellerIncome')
      .where('t.traded_at >= :start AND t.traded_at < :end', range)
      .getRawOne<{ tradeCount: string; tradeVolume: string; feeIncome: string; sellerIncome: string }>();

    return {
      type: 'nft' as const,
      period: this.periodVo(range, undefined, undefined),
      summary: {
        tradeCount: Number(summaryRow?.tradeCount ?? 0),
        tradeVolume: Number(summaryRow?.tradeVolume ?? 0),
        feeIncome: Number(summaryRow?.feeIncome ?? 0),
        sellerIncome: Number(summaryRow?.sellerIncome ?? 0),
      },
      daily: await this.buildDailyNft(range),
    };
  }

  private async buildDailyTrade(range: { start: Date; end: Date }) {
    const days = this.enumerateDays(range);
    const result: { date: string; orderCount: number; gmv: number; refundAmount: number }[] = [];

    for (const day of days) {
      const dayEnd = this.addDays(day, 1);
      const [orderRow, refundRow] = await Promise.all([
        this.orders
          .createQueryBuilder('o')
          .select('COUNT(*)', 'orderCount')
          .addSelect('COALESCE(SUM(o.pay_amount), 0)', 'gmv')
          .where('o.status IN (:...statuses)', { statuses: PAID_ORDER_STATUSES })
          .andWhere('o.paid_at >= :start AND o.paid_at < :end', { start: day, end: dayEnd })
          .getRawOne<{ orderCount: string; gmv: string }>(),
        this.aftersales
          .createQueryBuilder('a')
          .select('COALESCE(SUM(a.refund_amount), 0)', 'refundAmount')
          .where('a.status = :status', { status: 'refunded' })
          .andWhere('a.updated_at >= :start AND a.updated_at < :end', { start: day, end: dayEnd })
          .getRawOne<{ refundAmount: string }>(),
      ]);

      result.push({
        date: this.formatDate(day),
        orderCount: Number(orderRow?.orderCount ?? 0),
        gmv: Number(orderRow?.gmv ?? 0),
        refundAmount: Number(refundRow?.refundAmount ?? 0),
      });
    }

    return result;
  }

  private async buildDailyFund(range: { start: Date; end: Date }) {
    const days = this.enumerateDays(range);
    const result: { date: string; accrue: number; cashout: number; deduct: number }[] = [];

    for (const day of days) {
      const dayEnd = this.addDays(day, 1);
      const rows = await this.fundRecords
        .createQueryBuilder('r')
        .select('r.change_type', 'changeType')
        .addSelect('COALESCE(SUM(r.amount), 0)', 'total')
        .where('r.created_at >= :start AND r.created_at < :end', { start: day, end: dayEnd })
        .andWhere('r.change_type IN (:...types)', {
          types: ['order_accrue', 'checkin_cashout', 'order_deduct'],
        })
        .groupBy('r.change_type')
        .getRawMany<{ changeType: string; total: string }>();

      const map = Object.fromEntries(rows.map((item) => [item.changeType, Number(item.total)]));
      result.push({
        date: this.formatDate(day),
        accrue: map.order_accrue ?? 0,
        cashout: map.checkin_cashout ?? 0,
        deduct: Math.abs(map.order_deduct ?? 0),
      });
    }

    return result;
  }

  private async buildDailyWithdraw(range: { start: Date; end: Date }) {
    const days = this.enumerateDays(range);
    const result: { date: string; applyCount: number; applyAmount: number; paidAmount: number }[] =
      [];

    for (const day of days) {
      const dayEnd = this.addDays(day, 1);
      const [applyRow, paidRow] = await Promise.all([
        this.withdrawals
          .createQueryBuilder('w')
          .select('COUNT(*)', 'count')
          .addSelect('COALESCE(SUM(w.amount), 0)', 'amount')
          .where('w.created_at >= :start AND w.created_at < :end', { start: day, end: dayEnd })
          .getRawOne<{ count: string; amount: string }>(),
        this.withdrawals
          .createQueryBuilder('w')
          .select('COALESCE(SUM(w.actual_amount), 0)', 'amount')
          .where('w.status = :status', { status: 'paid' })
          .andWhere('w.paid_at >= :start AND w.paid_at < :end', { start: day, end: dayEnd })
          .getRawOne<{ amount: string }>(),
      ]);

      result.push({
        date: this.formatDate(day),
        applyCount: Number(applyRow?.count ?? 0),
        applyAmount: Number(applyRow?.amount ?? 0),
        paidAmount: Number(paidRow?.amount ?? 0),
      });
    }

    return result;
  }

  private async buildDailyNft(range: { start: Date; end: Date }) {
    const days = this.enumerateDays(range);
    const result: { date: string; tradeCount: number; tradeVolume: number; feeIncome: number }[] =
      [];

    for (const day of days) {
      const dayEnd = this.addDays(day, 1);
      const row = await this.nftTrades
        .createQueryBuilder('t')
        .select('COUNT(*)', 'tradeCount')
        .addSelect('COALESCE(SUM(t.price), 0)', 'tradeVolume')
        .addSelect('COALESCE(SUM(t.fee), 0)', 'feeIncome')
        .where('t.traded_at >= :start AND t.traded_at < :end', { start: day, end: dayEnd })
        .getRawOne<{ tradeCount: string; tradeVolume: string; feeIncome: string }>();

      result.push({
        date: this.formatDate(day),
        tradeCount: Number(row?.tradeCount ?? 0),
        tradeVolume: Number(row?.tradeVolume ?? 0),
        feeIncome: Number(row?.feeIncome ?? 0),
      });
    }

    return result;
  }

  private buildReconcileItem(
    key: string,
    title: string,
    description: string,
    platformAmount: number,
    referenceAmount: number,
  ) {
    const diff = this.round(platformAmount - referenceAmount);
    return {
      key,
      title,
      description,
      platformAmount: this.round(platformAmount),
      referenceAmount: this.round(referenceAmount),
      diff,
      status: Math.abs(diff) < 0.01 ? ('matched' as const) : ('diff' as const),
    };
  }

  private async loadUserPhoneMap(userIds: string[]) {
    const uniqueIds = [...new Set(userIds.filter(Boolean))];
    if (!uniqueIds.length) return new Map<string, string>();
    const users = await this.users.find({ where: { id: In(uniqueIds) } });
    return new Map(users.map((item) => [item.id, item.phone]));
  }

  private resolveDateRange(startDate?: string, endDate?: string) {
    const end = endDate ? this.parseDate(endDate) : this.startOfToday();
    const start = startDate
      ? this.parseDate(startDate)
      : this.addDays(end, -6);
    return {
      start,
      end: this.addDays(end, 1),
    };
  }

  private periodVo(range: { start: Date; end: Date }, startDate?: string, endDate?: string) {
    return {
      startDate: startDate ?? this.formatDate(range.start),
      endDate: endDate ?? this.formatDate(this.addDays(range.end, -1)),
    };
  }

  private enumerateDays(range: { start: Date; end: Date }) {
    const days: Date[] = [];
    const cursor = new Date(range.start);
    while (cursor < range.end) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  private parseDate(value: string) {
    const date = new Date(`${value}T00:00:00`);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
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

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
