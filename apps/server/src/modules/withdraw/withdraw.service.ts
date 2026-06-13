import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { FundRecordEntity } from '../../database/entities/fund-record.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { WithdrawalEntity } from '../../database/entities/withdrawal.entity';
import { WithdrawConfigService } from './withdraw-config.service';
import {
  AdminWithdrawAuditDto,
  AdminWithdrawListQueryDto,
  ApplyWithdrawDto,
  WithdrawRecordQueryDto,
} from './dto';

const METHOD_LABEL: Record<string, string> = {
  bank: '银行卡',
  wechat: '微信',
  alipay: '支付宝',
};

function maskAccountInfo(method: string, info: Record<string, string>) {
  if (method === 'bank') {
    const card = info.cardNo ?? '';
    return {
      accountName: info.accountName ?? '',
      bankName: info.bankName ?? '',
      cardNo: card.length >= 8 ? `${card.slice(0, 4)}****${card.slice(-4)}` : '****',
    };
  }
  const accountNo = info.accountNo ?? '';
  return {
    accountName: info.accountName ?? '',
    accountNo: accountNo.length >= 4 ? `****${accountNo.slice(-4)}` : '****',
  };
}

@Injectable()
export class WithdrawService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly withdrawConfig: WithdrawConfigService,
    @InjectRepository(WithdrawalEntity) private readonly withdrawals: Repository<WithdrawalEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async getConfig() {
    const rules = await this.withdrawConfig.getRules();
    return {
      min: rules.min,
      max: rules.max,
      fee: rules.fee,
      feeRate: rules.feeRate,
      methods: rules.methods,
      requireKyc: rules.requireKyc,
    };
  }

  async apply(userId: string, dto: ApplyWithdrawDto) {
    const rules = await this.withdrawConfig.getRules();
    const amount = this.roundMoney(dto.amount);

    if (!rules.methods.includes(dto.method)) {
      throw new BadRequestException('不支持的提现方式');
    }

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('用户不存在');
    if (rules.requireKyc && user.kycStatus !== 'passed') {
      throw new BadRequestException('请先完成实名认证');
    }

    this.validateAccountInfo(dto.method, dto.accountInfo);

    if (amount < rules.min) {
      throw new BadRequestException(`最低提现金额为 ${rules.min} 元`);
    }
    if (amount > rules.max) {
      throw new BadRequestException(`单次最高提现 ${rules.max} 元`);
    }

    const fee = this.roundMoney(Math.max(rules.fee, amount * rules.feeRate));
    const actualAmount = this.roundMoney(amount - fee);
    if (actualAmount <= 0) {
      throw new BadRequestException('提现金额不足以支付手续费');
    }

    return this.dataSource.transaction(async (manager) => {
      const accRepo = manager.getRepository(FundAccountEntity);
      const withdrawalRepo = manager.getRepository(WithdrawalEntity);

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const account = await accRepo.findOne({ where: { userId } });
        if (!account) throw new NotFoundException('资产账户不存在');
        if (account.withdrawableCash < amount) {
          throw new BadRequestException('提现金余额不足');
        }

        account.withdrawableCash = this.roundMoney(account.withdrawableCash - amount);
        account.frozenCash = this.roundMoney(account.frozenCash + amount);

        try {
          await accRepo.save(account);

          const row = await withdrawalRepo.save(
            withdrawalRepo.create({
              userId,
              amount,
              fee,
              actualAmount,
              method: dto.method,
              accountInfo: dto.accountInfo,
              status: 'pending',
            }),
          );

          return {
            withdrawId: Number(row.id),
            status: row.status,
            amount: row.amount,
            fee: row.fee,
            actualAmount: row.actualAmount,
          };
        } catch (error) {
          const retryable =
            error instanceof Error &&
            (error.name === 'OptimisticLockVersionMismatchError' ||
              error.message.includes('version'));
          if (!retryable || attempt === 2) throw error;
        }
      }

      throw new BadRequestException('提现申请失败，请重试');
    });
  }

  async listRecords(userId: string, query: WithdrawRecordQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.withdrawals
      .createQueryBuilder('w')
      .where('w.user_id = :userId', { userId })
      .orderBy('w.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.status && query.status !== 'all') {
      if (query.status === 'pending') {
        qb.andWhere('w.status IN (:...statuses)', {
          statuses: ['pending', 'auditing', 'approved', 'paying'],
        });
      } else if (query.status === 'paid') {
        qb.andWhere('w.status = :status', { status: 'paid' });
      } else if (query.status === 'rejected') {
        qb.andWhere('w.status IN (:...statuses)', { statuses: ['rejected', 'failed'] });
      }
    }

    const [rows, total] = await qb.getManyAndCount();
    return {
      list: rows.map((row) => this.toUserVo(row)),
      total,
    };
  }

  async adminList(query: AdminWithdrawListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.withdrawals
      .createQueryBuilder('w')
      .orderBy('w.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.status && query.status !== 'all') {
      if (query.status === 'pending') {
        qb.andWhere('w.status IN (:...statuses)', {
          statuses: ['pending', 'auditing', 'approved', 'paying'],
        });
      } else if (query.status === 'paid') {
        qb.andWhere('w.status = :status', { status: 'paid' });
      } else if (query.status === 'rejected') {
        qb.andWhere('w.status IN (:...statuses)', { statuses: ['rejected', 'failed'] });
      }
    }

    const [rows, total] = await qb.getManyAndCount();
    const userIds = rows.map((r) => r.userId);
    const userMap = new Map<string, UserEntity>();
    if (userIds.length) {
      const users = await this.users.find({ where: { id: In(userIds) } });
      users.forEach((u) => userMap.set(u.id, u));
    }

    return {
      list: rows.map((row) => {
        const user = userMap.get(row.userId);
        return {
          id: Number(row.id),
          userId: Number(row.userId),
          phone: user?.phone ?? '',
          kycStatus: user?.kycStatus ?? 'none',
          amount: row.amount,
          fee: row.fee,
          actualAmount: row.actualAmount,
          method: row.method,
          methodLabel: METHOD_LABEL[row.method] ?? row.method,
          accountInfo: maskAccountInfo(row.method, row.accountInfo),
          status: row.status,
          rejectReason: row.rejectReason ?? '',
          createdAt: row.createdAt,
          paidAt: row.paidAt ?? null,
        };
      }),
      total,
    };
  }

  async adminAudit(id: string, dto: AdminWithdrawAuditDto) {
    const withdrawal = await this.withdrawals.findOne({ where: { id } });
    if (!withdrawal) throw new NotFoundException('提现记录不存在');

    const pendingStatuses = ['pending', 'auditing', 'approved', 'paying'];
    if (!pendingStatuses.includes(withdrawal.status)) {
      throw new BadRequestException('该提现申请已处理');
    }

    if (dto.action === 'reject') {
      if (!dto.reason?.trim()) {
        throw new BadRequestException('驳回时请填写原因');
      }
      return this.rejectWithdrawal(withdrawal, dto.reason.trim());
    }

    return this.approveAndPay(withdrawal);
  }

  private async rejectWithdrawal(withdrawal: WithdrawalEntity, reason: string) {
    await this.dataSource.transaction(async (manager) => {
      const accRepo = manager.getRepository(FundAccountEntity);
      const withdrawalRepo = manager.getRepository(WithdrawalEntity);

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const account = await accRepo.findOne({ where: { userId: withdrawal.userId } });
        if (!account) throw new NotFoundException('资产账户不存在');

        account.frozenCash = this.roundMoney(account.frozenCash - withdrawal.amount);
        account.withdrawableCash = this.roundMoney(account.withdrawableCash + withdrawal.amount);
        if (account.frozenCash < 0) throw new BadRequestException('冻结金额异常');

        withdrawal.status = 'rejected';
        withdrawal.rejectReason = reason;

        try {
          await accRepo.save(account);
          await withdrawalRepo.save(withdrawal);
          return;
        } catch (error) {
          const retryable =
            error instanceof Error &&
            (error.name === 'OptimisticLockVersionMismatchError' ||
              error.message.includes('version'));
          if (!retryable || attempt === 2) throw error;
        }
      }
    });

    return { success: true, status: 'rejected' as const };
  }

  private async approveAndPay(withdrawal: WithdrawalEntity) {
    await this.dataSource.transaction(async (manager) => {
      const accRepo = manager.getRepository(FundAccountEntity);
      const withdrawalRepo = manager.getRepository(WithdrawalEntity);
      const recordRepo = manager.getRepository(FundRecordEntity);

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const account = await accRepo.findOne({ where: { userId: withdrawal.userId } });
        if (!account) throw new NotFoundException('资产账户不存在');

        account.frozenCash = this.roundMoney(account.frozenCash - withdrawal.amount);
        if (account.frozenCash < 0) throw new BadRequestException('冻结金额异常');

        withdrawal.status = 'paid';
        withdrawal.paidAt = new Date();

        try {
          await accRepo.save(account);
          await withdrawalRepo.save(withdrawal);

          await recordRepo.save(
            recordRepo.create({
              userId: withdrawal.userId,
              assetType: 'withdrawable_cash',
              changeType: 'withdraw',
              amount: -withdrawal.amount,
              balanceAfter: account.withdrawableCash,
              refType: 'withdraw',
              refId: withdrawal.id,
              remark: `提现到账 ${withdrawal.actualAmount} 元`,
            }),
          );
          return;
        } catch (error) {
          const retryable =
            error instanceof Error &&
            (error.name === 'OptimisticLockVersionMismatchError' ||
              error.message.includes('version'));
          if (!retryable || attempt === 2) throw error;
        }
      }
    });

    return { success: true, status: 'paid' as const };
  }

  private validateAccountInfo(method: string, info: Record<string, string>) {
    if (method === 'bank') {
      if (!info.accountName?.trim() || !info.bankName?.trim() || !info.cardNo?.trim()) {
        throw new BadRequestException('请填写完整的银行卡信息');
      }
      return;
    }
    if (!info.accountName?.trim() || !info.accountNo?.trim()) {
      throw new BadRequestException('请填写完整的收款账户信息');
    }
  }

  private toUserVo(row: WithdrawalEntity) {
    return {
      id: Number(row.id),
      amount: row.amount,
      fee: row.fee,
      actualAmount: row.actualAmount,
      method: row.method,
      methodLabel: METHOD_LABEL[row.method] ?? row.method,
      accountInfo: maskAccountInfo(row.method, row.accountInfo),
      status: row.status,
      rejectReason: row.rejectReason ?? '',
      createdAt: row.createdAt,
      paidAt: row.paidAt ?? null,
    };
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }
}
