import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { AftersaleEntity } from '../../database/entities/aftersale.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FundService } from '../fund/fund.service';
import { AdminAftersaleAuditDto, AftersaleListQueryDto, ApplyAftersaleDto } from './dto';

const APPLYABLE_STATUSES = ['paid', 'shipped', 'received', 'completed'] as const;
const ACTIVE_AFTERSALE_STATUSES = ['pending', 'approved'] as const;

const TYPE_LABEL: Record<string, string> = {
  refund_only: '仅退款',
  return_refund: '退货退款',
};

const STATUS_LABEL: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  refunded: '已退款',
};

@Injectable()
export class AftersaleService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly fundService: FundService,
    @InjectRepository(AftersaleEntity) private readonly aftersales: Repository<AftersaleEntity>,
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async apply(userId: string, dto: ApplyAftersaleDto) {
    const order = await this.orders.findOne({ where: { id: String(dto.orderId), userId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (!APPLYABLE_STATUSES.includes(order.status as (typeof APPLYABLE_STATUSES)[number])) {
      throw new BadRequestException('当前订单状态不可申请售后');
    }
    if (order.status === 'closed') {
      throw new BadRequestException('订单已关闭');
    }

    const existing = await this.aftersales.findOne({
      where: { orderId: order.id, status: In([...ACTIVE_AFTERSALE_STATUSES, 'refunded']) },
    });
    if (existing && existing.status !== 'rejected') {
      throw new BadRequestException('该订单已有进行中的售后申请');
    }

    const row = await this.aftersales.save(
      this.aftersales.create({
        orderId: order.id,
        userId,
        type: dto.type,
        reason: dto.reason.trim(),
        evidence: dto.evidence ?? null,
        refundAmount: order.payAmount,
        fundRollback: order.fundDeductAmount,
        fundVoid: 0,
        status: 'pending',
      }),
    );

    return {
      id: Number(row.id),
      status: row.status,
      refundAmount: row.refundAmount,
    };
  }

  async list(userId: string, query: AftersaleListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.aftersales
      .createQueryBuilder('a')
      .where('a.user_id = :userId', { userId })
      .orderBy('a.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.status && query.status !== 'all') {
      qb.andWhere('a.status = :status', { status: query.status });
    }

    const [rows, total] = await qb.getManyAndCount();
    const orderMap = await this.loadOrderMap(rows.map((r) => r.orderId));

    return {
      list: rows.map((row) => this.toUserVo(row, orderMap.get(row.orderId))),
      total,
    };
  }

  async detail(userId: string, id: string) {
    const row = await this.aftersales.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('售后记录不存在');
    const order = await this.orders.findOne({ where: { id: row.orderId } });
    return this.toUserVo(row, order ?? undefined);
  }

  async adminList(query: AftersaleListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.aftersales
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (query.status && query.status !== 'all') {
      qb.andWhere('a.status = :status', { status: query.status });
    }

    const [rows, total] = await qb.getManyAndCount();
    const orderMap = await this.loadOrderMap(rows.map((r) => r.orderId));
    const userMap = await this.loadUserMap(rows.map((r) => r.userId));

    return {
      list: rows.map((row) => {
        const order = orderMap.get(row.orderId);
        const user = userMap.get(row.userId);
        return {
          id: Number(row.id),
          orderId: Number(row.orderId),
          orderNo: order?.orderNo ?? '',
          userId: Number(row.userId),
          phone: user?.phone ?? '',
          type: row.type,
          typeLabel: TYPE_LABEL[row.type] ?? row.type,
          reason: row.reason,
          refundAmount: row.refundAmount,
          fundRollback: row.fundRollback,
          fundVoid: row.fundVoid,
          status: row.status,
          statusLabel: STATUS_LABEL[row.status] ?? row.status,
          createdAt: row.createdAt,
        };
      }),
      total,
    };
  }

  async adminAudit(id: string, dto: AdminAftersaleAuditDto) {
    const aftersale = await this.aftersales.findOne({ where: { id } });
    if (!aftersale) throw new NotFoundException('售后记录不存在');
    if (aftersale.status !== 'pending') {
      throw new BadRequestException('该售后申请已处理');
    }

    if (dto.action === 'reject') {
      if (!dto.reason?.trim()) {
        throw new BadRequestException('驳回时请填写原因');
      }
      aftersale.status = 'rejected';
      aftersale.reason = `${aftersale.reason}（驳回：${dto.reason.trim()}）`;
      await this.aftersales.save(aftersale);
      return { success: true, status: 'rejected' as const };
    }

    return this.approveRefund(aftersale);
  }

  private async approveRefund(aftersale: AftersaleEntity) {
    const order = await this.orders.findOne({ where: { id: aftersale.orderId } });
    if (!order) throw new NotFoundException('订单不存在');

    const fundRollback = Number(order.fundDeductAmount);
    let fundVoid = 0;

    await this.dataSource.transaction(async (manager) => {
      const aftersaleRepo = manager.getRepository(AftersaleEntity);
      const orderRepo = manager.getRepository(OrderEntity);

      const credited = await this.fundService.hasOrderFundAccrued(
        manager,
        aftersale.userId,
        order.id,
      );
      if (credited) {
        fundVoid = Number(order.accruedFund);
      }

      if (fundRollback > 0) {
        await this.fundService.rollbackAvailableForAftersale(
          manager,
          aftersale.userId,
          fundRollback,
          order.id,
          `售后回退抵扣 ${order.orderNo}`,
        );
      }
      if (fundVoid > 0) {
        await this.fundService.voidPendingForAftersale(
          manager,
          aftersale.userId,
          fundVoid,
          order.id,
          `售后冲销累计 ${order.orderNo}`,
        );
      }

      aftersale.fundRollback = fundRollback;
      aftersale.fundVoid = fundVoid;
      aftersale.status = 'refunded';
      await aftersaleRepo.save(aftersale);

      order.status = 'closed';
      await orderRepo.save(order);
    });

    return {
      success: true,
      status: 'refunded' as const,
      refundAmount: aftersale.refundAmount,
      fundRollback,
      fundVoid,
    };
  }

  private async loadOrderMap(orderIds: string[]) {
    const unique = [...new Set(orderIds)];
    if (!unique.length) return new Map<string, OrderEntity>();
    const rows = await this.orders.find({ where: { id: In(unique) } });
    return new Map(rows.map((o) => [o.id, o]));
  }

  private async loadUserMap(userIds: string[]) {
    const unique = [...new Set(userIds)];
    if (!unique.length) return new Map<string, UserEntity>();
    const rows = await this.users.find({ where: { id: In(unique) } });
    return new Map(rows.map((u) => [u.id, u]));
  }

  private toUserVo(row: AftersaleEntity, order?: OrderEntity) {
    return {
      id: Number(row.id),
      orderId: Number(row.orderId),
      orderNo: order?.orderNo ?? '',
      type: row.type,
      typeLabel: TYPE_LABEL[row.type] ?? row.type,
      reason: row.reason,
      refundAmount: row.refundAmount,
      fundRollback: row.fundRollback,
      fundVoid: row.fundVoid,
      status: row.status,
      statusLabel: STATUS_LABEL[row.status] ?? row.status,
      createdAt: row.createdAt,
    };
  }
}
