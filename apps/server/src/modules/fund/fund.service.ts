import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { CheckinPlanEntity } from '../../database/entities/checkin-plan.entity';
import { CheckinRecordEntity } from '../../database/entities/checkin-record.entity';
import { FundRecordEntity } from '../../database/entities/fund-record.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FundConfigService } from './fund-config.service';
import { FundRecordQueryDto } from './dto';

interface RecordInput {
  assetType: FundRecordEntity['assetType'];
  changeType: FundRecordEntity['changeType'];
  amount: number;
  refType?: FundRecordEntity['refType'];
  refId?: string;
  remark?: string;
}

@Injectable()
export class FundService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly fundConfig: FundConfigService,
    @InjectRepository(FundAccountEntity) private readonly accounts: Repository<FundAccountEntity>,
    @InjectRepository(FundRecordEntity) private readonly records: Repository<FundRecordEntity>,
    @InjectRepository(CheckinPlanEntity) private readonly plans: Repository<CheckinPlanEntity>,
    @InjectRepository(CheckinRecordEntity) private readonly checkinRecords: Repository<CheckinRecordEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async getAccount(userId: string) {
    const account = await this.ensureAccount(userId);
    const rules = await this.fundConfig.getRules();
    const activePlan = await this.plans.findOne({ where: { userId, status: 'active' } });

    return {
      pendingFund: account.pendingFund,
      availableFund: account.availableFund,
      withdrawableCash: account.withdrawableCash,
      tiers: rules.tiers.map((tier) => ({
        tier,
        reached: account.pendingFund >= tier,
      })),
      activePlan: activePlan ? this.toPlanVo(activePlan) : null,
      rules: {
        checkinDays: rules.checkinDays,
        missRule: rules.missRule,
        deductLimitRate: rules.deductLimitRate,
      },
    };
  }

  async listRecords(userId: string, query: FundRecordQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: { userId: string; assetType?: FundRecordEntity['assetType'] } = { userId };
    if (query.assetType) where.assetType = query.assetType;

    const [rows, total] = await this.records.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: rows.map((r) => ({
        id: Number(r.id),
        assetType: r.assetType,
        changeType: r.changeType,
        amount: r.amount,
        balanceAfter: r.balanceAfter,
        remark: r.remark,
        createdAt: r.createdAt,
      })),
      total,
    };
  }

  async startCheckin(userId: string, tier: number) {
    const rules = await this.fundConfig.getRules();
    if (!rules.tiers.includes(tier)) {
      throw new BadRequestException('无效的档位');
    }

    const active = await this.plans.findOne({ where: { userId, status: 'active' } });
    if (active) throw new BadRequestException('已有进行中的打卡计划');

    const account = await this.ensureAccount(userId);
    if (account.pendingFund < tier) {
      throw new BadRequestException('待兑现贡献金未达该档位');
    }

    const dailyAmount = this.roundMoney(tier / rules.checkinDays);

    return this.dataSource.transaction(async (manager) => {
      const accRepo = manager.getRepository(FundAccountEntity);
      const acc = await accRepo.findOne({ where: { userId } });
      if (!acc || acc.pendingFund < tier) {
        throw new BadRequestException('待兑现贡献金不足');
      }

      acc.pendingFund = this.roundMoney(acc.pendingFund - tier);
      await accRepo.save(acc);

      const plan = await manager.save(
        manager.create(CheckinPlanEntity, {
          userId,
          tier,
          totalAmount: tier,
          dailyAmount,
          totalDays: rules.checkinDays,
          signedDays: 0,
          cashedAmount: 0,
          voidAmount: 0,
          status: 'active',
          startedAt: new Date(),
        }),
      );

      return { planId: Number(plan.id), ...this.toPlanVo(plan) };
    });
  }

  async signCheckin(userId: string, planId: string) {
    const plan = await this.plans.findOne({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('打卡计划不存在');
    if (plan.status !== 'active') throw new BadRequestException('打卡计划已结束');

    const rules = await this.fundConfig.getRules();
    const today = this.todayDateStr();

    const signedToday = await this.checkinRecords.findOne({
      where: { planId: plan.id, checkinDate: today, status: 'signed' },
    });
    if (signedToday) throw new BadRequestException('今日已打卡');

    const lastRecord = await this.checkinRecords.findOne({
      where: { planId: plan.id },
      order: { dayIndex: 'DESC' },
    });

    const currentDayIndex = this.calcDayIndex(plan.startedAt, today);
    if (currentDayIndex > plan.totalDays) {
      throw new BadRequestException('打卡计划已到期');
    }

    return this.dataSource.transaction(async (manager) => {
      const planRepo = manager.getRepository(CheckinPlanEntity);
      const recordRepo = manager.getRepository(CheckinRecordEntity);
      const lockedPlan = await planRepo.findOne({ where: { id: planId, userId } });
      if (!lockedPlan || lockedPlan.status !== 'active') {
        throw new BadRequestException('打卡计划不可用');
      }

      const last = lastRecord
        ? await recordRepo.findOne({ where: { planId, userId }, order: { dayIndex: 'DESC' } })
        : null;
      const lastDayIndex = last?.dayIndex ?? 0;

      if (rules.missRule === 'void' && currentDayIndex > lastDayIndex + 1) {
        for (let day = lastDayIndex + 1; day < currentDayIndex; day += 1) {
          const missDate = this.dateByDayIndex(lockedPlan.startedAt, day);
          await recordRepo.save(
            recordRepo.create({
              planId: lockedPlan.id,
              userId,
              dayIndex: day,
              checkinDate: missDate,
              status: 'missed',
              cashoutAmount: 0,
            }),
          );
          lockedPlan.voidAmount = this.roundMoney(lockedPlan.voidAmount + lockedPlan.dailyAmount);
        }
      }

      lockedPlan.signedDays += 1;
      lockedPlan.cashedAmount = this.roundMoney(lockedPlan.cashedAmount + lockedPlan.dailyAmount);

      await this.applyBalanceChange(manager, userId, {
        availableDelta: lockedPlan.dailyAmount,
        records: [
          {
            assetType: 'available_fund',
            changeType: 'checkin_cashout',
            amount: lockedPlan.dailyAmount,
            refType: 'checkin',
            refId: lockedPlan.id,
            remark: `打卡兑现 第${currentDayIndex}天`,
          },
        ],
      });

      await recordRepo.save(
        recordRepo.create({
          planId: lockedPlan.id,
          userId,
          dayIndex: currentDayIndex,
          checkinDate: today,
          status: 'signed',
          cashoutAmount: lockedPlan.dailyAmount,
        }),
      );

      if (lockedPlan.signedDays >= lockedPlan.totalDays) {
        lockedPlan.status = 'completed';
      }

      await planRepo.save(lockedPlan);

      return {
        cashoutAmount: lockedPlan.dailyAmount,
        signedDays: lockedPlan.signedDays,
        plan: this.toPlanVo(lockedPlan),
      };
    });
  }

  async getPlan(userId: string, planId: string) {
    const plan = await this.plans.findOne({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('打卡计划不存在');
    return this.toPlanVo(plan);
  }

  async getPlanRecords(userId: string, planId: string) {
    const plan = await this.plans.findOne({ where: { id: planId, userId } });
    if (!plan) throw new NotFoundException('打卡计划不存在');

    const list = await this.checkinRecords.find({
      where: { planId: plan.id, userId },
      order: { dayIndex: 'ASC' },
    });

    return {
      list: list.map((r) => ({
        id: Number(r.id),
        dayIndex: r.dayIndex,
        checkinDate: r.checkinDate,
        status: r.status,
        cashoutAmount: r.cashoutAmount,
      })),
    };
  }

  async accruePendingByPhone(phone: string, amount: number, remark?: string) {
    const user = await this.users.findOne({ where: { phone } });
    if (!user) throw new NotFoundException('用户不存在');
    await this.accruePending(user.id, amount, remark);
    return { success: true };
  }

  async accruePending(userId: string, amount: number, remark = '贡献金累计') {
    await this.dataSource.transaction((manager) =>
      this.applyBalanceChange(manager, userId, {
        pendingDelta: amount,
        records: [
          {
            assetType: 'pending_fund',
            changeType: 'order_accrue',
            amount,
            refType: 'order',
            remark,
          },
        ],
      }),
    );
  }

  private async applyBalanceChange(
    manager: DataSource['manager'],
    userId: string,
    input: { pendingDelta?: number; availableDelta?: number; cashDelta?: number; records: RecordInput[] },
  ) {
    const accRepo = manager.getRepository(FundAccountEntity);
    const recordRepo = manager.getRepository(FundRecordEntity);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const account = await accRepo.findOne({ where: { userId } });
      if (!account) throw new NotFoundException('资产账户不存在');

      if (input.pendingDelta) {
        account.pendingFund = this.roundMoney(account.pendingFund + input.pendingDelta);
        if (account.pendingFund < 0) throw new BadRequestException('待兑现贡献金不足');
      }
      if (input.availableDelta) {
        account.availableFund = this.roundMoney(account.availableFund + input.availableDelta);
        if (account.availableFund < 0) throw new BadRequestException('可用贡献金不足');
      }
      if (input.cashDelta) {
        account.withdrawableCash = this.roundMoney(account.withdrawableCash + input.cashDelta);
        if (account.withdrawableCash < 0) throw new BadRequestException('提现金不足');
      }

      try {
        await accRepo.save(account);
        for (const rec of input.records) {
          const balanceAfter =
            rec.assetType === 'pending_fund'
              ? account.pendingFund
              : rec.assetType === 'available_fund'
                ? account.availableFund
                : account.withdrawableCash;

          await recordRepo.save(
            recordRepo.create({
              userId,
              assetType: rec.assetType,
              changeType: rec.changeType,
              amount: rec.amount,
              balanceAfter,
              refType: rec.refType,
              refId: rec.refId,
              remark: rec.remark,
            }),
          );
        }
        return;
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
  }

  private async ensureAccount(userId: string) {
    let account = await this.accounts.findOne({ where: { userId } });
    if (!account) {
      account = await this.accounts.save(this.accounts.create({ userId }));
    }
    return account;
  }

  private toPlanVo(plan: CheckinPlanEntity) {
    return {
      id: Number(plan.id),
      tier: plan.tier,
      totalAmount: plan.totalAmount,
      dailyAmount: plan.dailyAmount,
      totalDays: plan.totalDays,
      signedDays: plan.signedDays,
      cashedAmount: plan.cashedAmount,
      voidAmount: plan.voidAmount,
      status: plan.status,
      startedAt: plan.startedAt,
    };
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }

  private todayDateStr() {
    return this.formatDate(new Date());
  }

  private formatDate(date: Date) {
    const offset = date.getTime() + 8 * 3600 * 1000;
    return new Date(offset).toISOString().slice(0, 10);
  }

  private calcDayIndex(startedAt: Date, today: string) {
    const start = this.formatDate(startedAt);
    const [sy, sm, sd] = start.split('-').map(Number);
    const [ty, tm, td] = today.split('-').map(Number);
    const startMs = Date.UTC(sy, sm - 1, sd);
    const todayMs = Date.UTC(ty, tm - 1, td);
    return Math.floor((todayMs - startMs) / 86400000) + 1;
  }

  private dateByDayIndex(startedAt: Date, dayIndex: number) {
    const start = this.formatDate(startedAt);
    const [y, m, d] = start.split('-').map(Number);
    const ms = Date.UTC(y, m - 1, d) + (dayIndex - 1) * 86400000;
    const date = new Date(ms);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  }
}
