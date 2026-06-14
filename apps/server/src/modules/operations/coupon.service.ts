import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { CampaignEntity } from '../../database/entities/campaign.entity';
import { CouponEntity } from '../../database/entities/coupon.entity';
import { UserCouponEntity } from '../../database/entities/user-coupon.entity';
import { AdminCampaignSaveDto, AdminCouponSaveDto, AdminListQueryDto } from './dto';

@Injectable()
export class CouponService implements OnModuleInit {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CouponEntity) private readonly coupons: Repository<CouponEntity>,
    @InjectRepository(UserCouponEntity) private readonly userCoupons: Repository<UserCouponEntity>,
  ) {}

  async onModuleInit() {
    const count = await this.coupons.count();
    if (count === 0) {
      const now = new Date();
      const end = new Date(now);
      end.setMonth(end.getMonth() + 3);
      await this.coupons.save([
        this.coupons.create({
          name: '新人满50减5',
          type: 'fixed',
          value: 5,
          minAmount: 50,
          total: 1000,
          status: 'enabled',
          startAt: now,
          endAt: end,
        }),
        this.coupons.create({
          name: '全场9折券',
          type: 'discount',
          value: 0.9,
          minAmount: 100,
          total: 500,
          status: 'enabled',
          startAt: now,
          endAt: end,
        }),
      ]);
    }
  }

  async adminList(query: AdminListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [list, total] = await this.coupons.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list: list.map((item) => this.toCouponVo(item)), total, page, pageSize };
  }

  async adminCreate(dto: AdminCouponSaveDto) {
    const saved = await this.coupons.save(this.coupons.create(this.fromSaveDto(dto)));
    return this.toCouponVo(saved);
  }

  async adminUpdate(id: string, dto: AdminCouponSaveDto) {
    const coupon = await this.coupons.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    Object.assign(coupon, this.fromSaveDto(dto));
    const saved = await this.coupons.save(coupon);
    return this.toCouponVo(saved);
  }

  async adminToggle(id: string, status: 'enabled' | 'disabled') {
    const coupon = await this.coupons.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('优惠券不存在');
    coupon.status = status;
    await this.coupons.save(coupon);
    return { success: true };
  }

  async listClaimable(userId: string) {
    const now = new Date();
    const coupons = await this.coupons.find({
      where: { status: 'enabled' },
      order: { id: 'DESC' },
    });
    const claimed = await this.userCoupons.find({ where: { userId } });
    const claimedSet = new Set(claimed.map((item) => item.couponId));

    return {
      list: coupons
        .filter((item) => this.isCouponActive(item, now) && item.total > item.claimed)
        .map((item) => ({
          ...this.toCouponVo(item),
          claimed: claimedSet.has(item.id),
        })),
    };
  }

  async listMine(userId: string) {
    const rows = await this.userCoupons.find({
      where: { userId },
      order: { id: 'DESC' },
    });
    const couponIds = [...new Set(rows.map((item) => item.couponId))];
    const coupons = couponIds.length
      ? await this.coupons.find({ where: { id: In(couponIds) } })
      : [];
    const couponMap = new Map(coupons.map((item) => [item.id, item]));

    return {
      list: rows.map((row) => {
        const coupon = couponMap.get(row.couponId);
        return {
          id: Number(row.id),
          status: row.status,
          claimedAt: row.claimedAt,
          usedAt: row.usedAt ?? null,
          coupon: coupon ? this.toCouponVo(coupon) : null,
        };
      }),
    };
  }

  async claim(userId: string, couponId: string) {
    const coupon = await this.coupons.findOne({ where: { id: couponId, status: 'enabled' } });
    if (!coupon) throw new NotFoundException('优惠券不存在或已下架');
    if (!this.isCouponActive(coupon, new Date())) {
      throw new BadRequestException('优惠券不在有效期内');
    }
    if (coupon.total > 0 && coupon.claimed >= coupon.total) {
      throw new BadRequestException('优惠券已领完');
    }

    const exists = await this.userCoupons.findOne({ where: { userId, couponId } });
    if (exists) throw new BadRequestException('您已领取过该优惠券');

    return this.dataSource.transaction(async (manager) => {
      const couponRepo = manager.getRepository(CouponEntity);
      const userCouponRepo = manager.getRepository(UserCouponEntity);
      const fresh = await couponRepo.findOne({ where: { id: couponId } });
      if (!fresh || (fresh.total > 0 && fresh.claimed >= fresh.total)) {
        throw new BadRequestException('优惠券已领完');
      }
      fresh.claimed += 1;
      await couponRepo.save(fresh);
      const saved = await userCouponRepo.save(
        userCouponRepo.create({ userId, couponId, claimedAt: new Date() }),
      );
      return { id: Number(saved.id), couponId: Number(couponId) };
    });
  }

  async resolveForOrder(userId: string, userCouponId: number, orderTotal: number) {
    const row = await this.userCoupons.findOne({
      where: { id: String(userCouponId), userId, status: 'unused' },
    });
    if (!row) throw new BadRequestException('优惠券不可用');
    const coupon = await this.coupons.findOne({ where: { id: row.couponId, status: 'enabled' } });
    if (!coupon || !this.isCouponActive(coupon, new Date())) {
      throw new BadRequestException('优惠券已过期');
    }
    if (orderTotal < coupon.minAmount) {
      throw new BadRequestException(`订单满 ${coupon.minAmount} 元可用`);
    }
    const amount = this.calcDiscount(coupon, orderTotal);
    return { userCoupon: row, coupon, couponAmount: amount };
  }

  async markUsed(userCouponId: string, orderId: string, manager?: EntityManager) {
    const run = async (m: EntityManager) => {
      const userCouponRepo = m.getRepository(UserCouponEntity);
      const couponRepo = m.getRepository(CouponEntity);
      const row = await userCouponRepo.findOne({ where: { id: userCouponId } });
      if (!row || row.status !== 'unused') throw new BadRequestException('优惠券状态异常');
      row.status = 'used';
      row.orderId = orderId;
      row.usedAt = new Date();
      await userCouponRepo.save(row);
      await couponRepo.increment({ id: row.couponId }, 'used', 1);
    };
    if (manager) return run(manager);
    return this.dataSource.transaction(run);
  }

  calcDiscount(coupon: CouponEntity, orderTotal: number) {
    if (coupon.type === 'fixed') {
      return Math.min(coupon.value, orderTotal);
    }
    const discounted = orderTotal * (1 - coupon.value);
    return Math.round(discounted * 100) / 100;
  }

  private isCouponActive(coupon: CouponEntity, now: Date) {
    if (coupon.startAt && now < coupon.startAt) return false;
    if (coupon.endAt && now > coupon.endAt) return false;
    return true;
  }

  private fromSaveDto(dto: AdminCouponSaveDto) {
    return {
      name: dto.name,
      type: dto.type,
      value: dto.value,
      minAmount: dto.minAmount ?? 0,
      total: dto.total ?? 0,
      status: dto.status ?? 'enabled',
      startAt: dto.startAt ? new Date(dto.startAt) : undefined,
      endAt: dto.endAt ? new Date(dto.endAt) : undefined,
    };
  }

  private toCouponVo(item: CouponEntity) {
    return {
      id: Number(item.id),
      name: item.name,
      type: item.type,
      value: item.value,
      minAmount: item.minAmount,
      total: item.total,
      claimed: item.claimed,
      used: item.used,
      status: item.status,
      startAt: item.startAt ?? null,
      endAt: item.endAt ?? null,
      createdAt: item.createdAt,
    };
  }
}
