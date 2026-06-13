import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, LessThanOrEqual, Like, Repository } from 'typeorm';
import { AddressEntity } from '../../database/entities/address.entity';
import { CartItemEntity } from '../../database/entities/cart-item.entity';
import { CategoryEntity } from '../../database/entities/category.entity';
import { FundAccountEntity } from '../../database/entities/fund-account.entity';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderItemEntity } from '../../database/entities/order-item.entity';
import { PaymentEntity } from '../../database/entities/payment.entity';
import { ProductEntity } from '../../database/entities/product.entity';
import { SkuEntity } from '../../database/entities/sku.entity';
import { UserEntity } from '../../database/entities/user.entity';
import { FundConfigService } from '../fund/fund-config.service';
import { FundService } from '../fund/fund.service';
import { AdminOrderListQueryDto, CreateOrderDto, OrderItemInputDto, OrderListQueryDto, OrderPreviewDto, PayOrderDto } from './dto';

const DEFAULT_FUND_RATIO = 0.1;
const FREIGHT = 0;
/** 发货后超过该天数未确认收货，自动完成 */
export const AUTO_RECEIVE_DAYS = 15;

interface ResolvedLine {
  productId: string;
  skuId: string;
  quantity: number;
  price: number;
  fundRatio: number;
  allowFundDeduct: boolean;
  deductLimitRate?: number;
  itemFund: number;
  lineAmount: number;
  productSnapshot: Record<string, unknown>;
}

interface CalcResult {
  totalAmount: number;
  fundDeductMax: number;
  fundDeductAmount: number;
  freight: number;
  payAmount: number;
  accruedFund: number;
  lines: ResolvedLine[];
}

@Injectable()
export class OrderService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly fundService: FundService,
    private readonly fundConfig: FundConfigService,
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity) private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(PaymentEntity) private readonly payments: Repository<PaymentEntity>,
    @InjectRepository(AddressEntity) private readonly addresses: Repository<AddressEntity>,
    @InjectRepository(ProductEntity) private readonly products: Repository<ProductEntity>,
    @InjectRepository(SkuEntity) private readonly skus: Repository<SkuEntity>,
    @InjectRepository(CategoryEntity) private readonly categories: Repository<CategoryEntity>,
    @InjectRepository(FundAccountEntity) private readonly fundAccounts: Repository<FundAccountEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async preview(userId: string, dto: OrderPreviewDto) {
    const calc = await this.calculate(userId, dto);
    return {
      totalAmount: calc.totalAmount,
      fundDeductMax: calc.fundDeductMax,
      fundDeductAmount: calc.fundDeductAmount,
      freight: calc.freight,
      payAmount: calc.payAmount,
      accruedFund: calc.accruedFund,
    };
  }

  async create(userId: string, dto: CreateOrderDto) {
    const address = await this.addresses.findOne({ where: { id: String(dto.addressId), userId } });
    if (!address) throw new BadRequestException('收货地址不存在');

    const calc = await this.calculate(userId, dto);

    return this.dataSource.transaction(async (manager) => {
      const skuRepo = manager.getRepository(SkuEntity);
      const productRepo = manager.getRepository(ProductEntity);

      for (const line of calc.lines) {
        const sku = await skuRepo.findOne({ where: { id: line.skuId } });
        if (!sku || sku.stock < line.quantity) {
          throw new BadRequestException('库存不足');
        }
        sku.stock -= line.quantity;
        await skuRepo.save(sku);

        await productRepo.increment({ id: line.productId }, 'sales', line.quantity);
      }

      const orderNo = this.genOrderNo();
      const order = await manager.save(
        manager.create(OrderEntity, {
          orderNo,
          userId,
          addressSnapshot: this.toAddressSnapshot(address),
          totalAmount: calc.totalAmount,
          fundDeductAmount: calc.fundDeductAmount,
          couponAmount: 0,
          freight: calc.freight,
          payAmount: calc.payAmount,
          accruedFund: calc.accruedFund,
          status: 'unpaid',
        }),
      );

      for (const line of calc.lines) {
        await manager.save(
          manager.create(OrderItemEntity, {
            orderId: order.id,
            productId: line.productId,
            skuId: line.skuId,
            productSnapshot: line.productSnapshot,
            price: line.price,
            quantity: line.quantity,
            itemFund: this.roundMoney(line.itemFund * line.quantity),
          }),
        );
      }

      if (calc.fundDeductAmount > 0) {
        await this.fundService.deductAvailable(
          manager,
          userId,
          calc.fundDeductAmount,
          order.id,
          `订单抵扣 ${orderNo}`,
        );
      }

      await manager.getRepository(CartItemEntity).delete({
        userId,
        skuId: In(calc.lines.map((l) => l.skuId)),
      });

      return { orderNo: order.orderNo, orderId: Number(order.id) };
    });
  }

  async list(userId: string, query: OrderListQueryDto) {
    await this.autoReceiveExpiredOrders();

    const page = query.page ?? 1;
    const pageSize = 10;
    const where: { userId: string; status?: OrderEntity['status'] } = { userId };
    if (query.status && query.status !== 'all' && query.status !== 'aftersale') {
      where.status = query.status;
    }

    const [rows, total] = await this.orders.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const list = await Promise.all(rows.map((o) => this.toOrderListVo(o)));
    return { list, total };
  }

  async detail(userId: string, id: string) {
    await this.autoReceiveExpiredOrders();

    const order = await this.orders.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundException('订单不存在');
    return this.toOrderDetailVo(order);
  }

  async pay(userId: string, id: string, dto: PayOrderDto) {
    const channel = dto.channel ?? 'wechat';

    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(OrderEntity);
      const paymentRepo = manager.getRepository(PaymentEntity);

      const order = await orderRepo.findOne({ where: { id, userId } });
      if (!order) throw new NotFoundException('订单不存在');
      if (order.status !== 'unpaid') throw new BadRequestException('订单状态不可支付');

      const tradeNo = `MOCK${Date.now()}${Math.floor(Math.random() * 1000)}`;
      await paymentRepo.save(
        paymentRepo.create({
          orderId: order.id,
          channel,
          tradeNo,
          amount: order.payAmount,
          status: 'success',
        }),
      );

      order.status = 'paid';
      order.payMethod = channel;
      order.paidAt = new Date();
      await orderRepo.save(order);

      return {
        payParams: { mock: true, tradeNo, channel },
        status: 'success',
        accruedFund: order.accruedFund,
      };
    });
  }

  async payStatus(userId: string, id: string) {
    const order = await this.orders.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundException('订单不存在');
    return { status: order.status === 'unpaid' ? 'pending' : 'success' };
  }

  async receive(userId: string, id: string) {
    const order = await this.orders.findOne({ where: { id, userId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 'shipped') throw new BadRequestException('订单状态不可确认收货');

    const completed = await this.completeOrderWithFundAccrual(order);
    if (!completed) throw new BadRequestException('订单状态不可确认收货');

    return {
      success: true,
      status: completed.order.status,
      receivedAt: completed.order.receivedAt,
      accruedFund: completed.fundCredited,
    };
  }

  /** 发货满 AUTO_RECEIVE_DAYS 天未确认收货，自动完成并累计贡献金 */
  async autoReceiveExpiredOrders() {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() - AUTO_RECEIVE_DAYS);

    const expired = await this.orders.find({
      where: {
        status: 'shipped',
        shippedAt: LessThanOrEqual(deadline),
      },
    });

    let affected = 0;
    for (const order of expired) {
      const completed = await this.completeOrderWithFundAccrual(order);
      if (completed) affected += 1;
    }

    return { affected };
  }

  private async completeOrderWithFundAccrual(order: OrderEntity) {
    return this.dataSource.transaction(async (manager) => {
      const orderRepo = manager.getRepository(OrderEntity);
      const locked = await orderRepo.findOne({ where: { id: order.id, status: 'shipped' } });
      if (!locked) return null;

      locked.status = 'completed';
      locked.receivedAt = new Date();
      await orderRepo.save(locked);

      const accruedAmount = Number(locked.accruedFund);
      let fundCredited = 0;
      if (accruedAmount > 0) {
        await this.fundService.accruePendingForOrder(
          manager,
          locked.userId,
          accruedAmount,
          locked.id,
          `确认收货累计 ${locked.orderNo}`,
        );
        fundCredited = accruedAmount;
      }

      return { order: locked, fundCredited };
    });
  }

  async adminList(query: AdminOrderListQueryDto) {
    await this.autoReceiveExpiredOrders();

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Record<string, unknown> = {};
    if (query.status && query.status !== 'all') {
      where.status = query.status;
    }
    if (query.orderNo) {
      where.orderNo = Like(`%${query.orderNo}%`);
    }

    const [rows, total] = await this.orders.findAndCount({
      where,
      order: { id: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const userMap = await this.loadUserMap(rows.map((o) => o.userId));
    const list = await Promise.all(rows.map((o) => this.toAdminOrderListVo(o, userMap.get(o.userId))));

    return { list, total };
  }

  async adminDetail(id: string) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('订单不存在');

    const user = await this.users.findOne({ where: { id: order.userId } });
    const detail = await this.toOrderDetailVo(order);
    return {
      ...detail,
      userId: Number(order.userId),
      userPhone: user?.phone ?? '',
    };
  }

  async adminShip(id: string) {
    const order = await this.orders.findOne({ where: { id } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 'paid') {
      throw new BadRequestException('仅待发货（已支付）订单可发货');
    }

    order.status = 'shipped';
    order.shippedAt = new Date();
    await this.orders.save(order);

    return { success: true, orderNo: order.orderNo, status: order.status, shippedAt: order.shippedAt };
  }

  private async loadUserMap(userIds: string[]) {
    const unique = [...new Set(userIds)];
    if (!unique.length) return new Map<string, UserEntity>();
    const rows = await this.users.find({ where: { id: In(unique) } });
    return new Map(rows.map((u) => [u.id, u]));
  }

  private async toAdminOrderListVo(order: OrderEntity, user?: UserEntity) {
    const items = await this.orderItems.find({ where: { orderId: order.id }, take: 3 });
    const itemCount = await this.orderItems.count({ where: { orderId: order.id } });
    return {
      id: Number(order.id),
      orderNo: order.orderNo,
      userId: Number(order.userId),
      userPhone: user?.phone ?? '',
      status: order.status,
      payAmount: order.payAmount,
      totalAmount: order.totalAmount,
      fundDeductAmount: order.fundDeductAmount,
      accruedFund: order.accruedFund,
      payMethod: order.payMethod,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      createdAt: order.createdAt,
      itemCount,
      items: items.map((i) => ({
        title: (i.productSnapshot.title as string) ?? '',
        quantity: i.quantity,
      })),
    };
  }

  private async calculate(userId: string, dto: OrderPreviewDto): Promise<CalcResult> {
    const lines = await this.resolveItems(dto.items);
    const rules = await this.fundConfig.getRules();
    const account = await this.fundAccounts.findOne({ where: { userId } });

    const totalAmount = this.roundMoney(lines.reduce((sum, l) => sum + l.lineAmount, 0));
    const accruedFund = this.roundMoney(lines.reduce((sum, l) => sum + l.itemFund * l.quantity, 0));

    let fundDeductMax = 0;
    for (const line of lines) {
      if (!line.allowFundDeduct) continue;
      const rate = line.deductLimitRate ?? rules.deductLimitRate;
      fundDeductMax = this.roundMoney(fundDeductMax + line.lineAmount * rate);
    }

    const availableFund = account?.availableFund ?? 0;
    let fundDeductAmount = 0;
    if (dto.useFund) {
      const requested = dto.fundAmount != null ? dto.fundAmount : fundDeductMax;
      fundDeductAmount = this.roundMoney(Math.min(requested, fundDeductMax, availableFund));
      if (fundDeductAmount < 0) fundDeductAmount = 0;
    }

    const payAmount = this.roundMoney(Math.max(totalAmount - fundDeductAmount + FREIGHT, 0));

    return {
      totalAmount,
      fundDeductMax,
      fundDeductAmount,
      freight: FREIGHT,
      payAmount,
      accruedFund,
      lines,
    };
  }

  private async resolveItems(items: OrderItemInputDto[]): Promise<ResolvedLine[]> {
    const lines: ResolvedLine[] = [];

    for (const item of items) {
      const sku = await this.skus.findOne({ where: { id: String(item.skuId) } });
      if (!sku) throw new NotFoundException(`规格 ${item.skuId} 不存在`);
      if (sku.stock < item.quantity) throw new BadRequestException('库存不足');

      const product = await this.products.findOne({
        where: { id: sku.productId, status: 'on_sale', deletedAt: IsNull() },
      });
      if (!product) throw new NotFoundException('商品不存在或已下架');

      const category = await this.categories.findOne({ where: { id: product.categoryId } });
      const price = Number(sku.price);
      const fundRatio = this.resolveFundRatio(product.fundRatio, category?.fundRatio);
      const lineAmount = this.roundMoney(price * item.quantity);
      const itemFund = this.roundMoney(price * fundRatio);

      lines.push({
        productId: product.id,
        skuId: sku.id,
        quantity: item.quantity,
        price,
        fundRatio,
        allowFundDeduct: product.allowFundDeduct,
        deductLimitRate: product.deductLimitRate ? Number(product.deductLimitRate) : undefined,
        itemFund,
        lineAmount,
        productSnapshot: {
          title: product.title,
          mainImage: sku.skuImage ?? product.mainImage,
          spec: sku.spec,
        },
      });
    }

    return lines;
  }

  private async toOrderListVo(order: OrderEntity) {
    const items = await this.orderItems.find({ where: { orderId: order.id } });
    return {
      id: Number(order.id),
      orderNo: order.orderNo,
      status: order.status,
      payAmount: order.payAmount,
      totalAmount: order.totalAmount,
      fundDeductAmount: order.fundDeductAmount,
      accruedFund: order.accruedFund,
      createdAt: order.createdAt,
      items: items.map((i) => ({
        id: Number(i.id),
        productId: Number(i.productId),
        title: (i.productSnapshot.title as string) ?? '',
        mainImage: (i.productSnapshot.mainImage as string) ?? '',
        price: i.price,
        quantity: i.quantity,
      })),
    };
  }

  private async toOrderDetailVo(order: OrderEntity) {
    const items = await this.orderItems.find({ where: { orderId: order.id } });
    return {
      id: Number(order.id),
      orderNo: order.orderNo,
      status: order.status,
      address: order.addressSnapshot,
      totalAmount: order.totalAmount,
      fundDeductAmount: order.fundDeductAmount,
      couponAmount: order.couponAmount,
      freight: order.freight,
      payAmount: order.payAmount,
      accruedFund: order.accruedFund,
      payMethod: order.payMethod,
      paidAt: order.paidAt,
      shippedAt: order.shippedAt,
      receivedAt: order.receivedAt,
      createdAt: order.createdAt,
      items: items.map((i) => ({
        id: Number(i.id),
        productId: Number(i.productId),
        skuId: i.skuId ? Number(i.skuId) : null,
        title: (i.productSnapshot.title as string) ?? '',
        mainImage: (i.productSnapshot.mainImage as string) ?? '',
        spec: i.productSnapshot.spec,
        price: i.price,
        quantity: i.quantity,
        itemFund: i.itemFund,
      })),
    };
  }

  private toAddressSnapshot(address: AddressEntity) {
    return {
      receiver: address.receiver,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
    };
  }

  private genOrderNo() {
    const ts = Date.now().toString();
    const rand = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    return `SM${ts}${rand}`;
  }

  private resolveFundRatio(productRatio?: string | null, categoryRatio?: string | null) {
    if (productRatio != null) return Number(productRatio);
    if (categoryRatio != null) return Number(categoryRatio);
    return DEFAULT_FUND_RATIO;
  }

  private roundMoney(value: number) {
    return Math.round(value * 100) / 100;
  }
}
