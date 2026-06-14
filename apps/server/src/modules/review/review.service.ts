import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { OrderEntity } from '../../database/entities/order.entity';
import { OrderItemEntity } from '../../database/entities/order-item.entity';
import { ProductReviewEntity } from '../../database/entities/product-review.entity';
import { UserEntity } from '../../database/entities/user.entity';
import {
  AdminReviewAuditDto,
  AdminReviewListQueryDto,
  ProductReviewListQueryDto,
  SubmitReviewDto,
} from './dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(ProductReviewEntity) private readonly reviews: Repository<ProductReviewEntity>,
    @InjectRepository(OrderEntity) private readonly orders: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity) private readonly orderItems: Repository<OrderItemEntity>,
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
  ) {}

  async isOrderReviewed(orderId: string) {
    const count = await this.reviews.count({ where: { orderId } });
    return count > 0;
  }

  async getOrderReview(userId: string, orderId: string) {
    const order = await this.orders.findOne({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('订单不存在');

    const review = await this.reviews.findOne({ where: { orderId } });
    if (!review) return { reviewed: false, review: null };

    return {
      reviewed: true,
      review: this.toUserVo(review),
    };
  }

  async submit(userId: string, orderId: string, dto: SubmitReviewDto) {
    const order = await this.orders.findOne({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== 'completed') {
      throw new BadRequestException('仅已完成订单可评价');
    }

    const existing = await this.reviews.findOne({ where: { orderId } });
    if (existing) throw new BadRequestException('该订单已评价');

    const firstItem = await this.orderItems.findOne({
      where: { orderId },
      order: { id: 'ASC' },
    });
    if (!firstItem) throw new BadRequestException('订单无商品明细');

    const saved = await this.reviews.save(
      this.reviews.create({
        orderId,
        userId,
        productId: firstItem.productId,
        rating: dto.rating,
        content: dto.content.trim(),
        images: dto.images?.length ? dto.images : null,
        isAnonymous: dto.isAnonymous ?? false,
        status: 'shown',
      }),
    );

    return {
      id: Number(saved.id),
      rating: saved.rating,
      content: saved.content,
    };
  }

  async listByProduct(productId: string, query: ProductReviewListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const [rows, total] = await this.reviews.findAndCount({
      where: { productId, status: 'shown' },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const userMap = await this.loadUserMap(rows.map((r) => r.userId));
    return {
      list: rows.map((r) => this.toPublicVo(r, userMap.get(r.userId))),
      total,
    };
  }

  async adminList(query: AdminReviewListQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.reviews.createQueryBuilder('r').orderBy('r.created_at', 'DESC');

    if (query.status && query.status !== 'all') {
      qb.andWhere('r.status = :status', { status: query.status });
    }

    qb.skip((page - 1) * pageSize).take(pageSize);
    const [rows, total] = await qb.getManyAndCount();

    const orderIds = rows.map((r) => r.orderId);
    const orderMap = new Map<string, OrderEntity>();
    if (orderIds.length) {
      const orders = await this.orders.find({ where: { id: In(orderIds) } });
      orders.forEach((o) => orderMap.set(o.id, o));
    }

    const userMap = await this.loadUserMap(rows.map((r) => r.userId));

    return {
      list: rows.map((r) => ({
        id: Number(r.id),
        orderId: Number(r.orderId),
        orderNo: orderMap.get(r.orderId)?.orderNo ?? '',
        userId: Number(r.userId),
        userPhone: userMap.get(r.userId)?.phone ?? '',
        productId: Number(r.productId),
        rating: r.rating,
        content: r.content,
        images: r.images ?? [],
        isAnonymous: r.isAnonymous,
        status: r.status,
        adminReply: r.adminReply,
        createdAt: r.createdAt,
      })),
      total,
    };
  }

  async adminAudit(id: string, dto: AdminReviewAuditDto) {
    const review = await this.reviews.findOne({ where: { id } });
    if (!review) throw new NotFoundException('评价不存在');

    review.status = dto.status;
    if (dto.adminReply != null) review.adminReply = dto.adminReply;
    await this.reviews.save(review);

    return { success: true, status: review.status };
  }

  private toUserVo(review: ProductReviewEntity) {
    return {
      id: Number(review.id),
      rating: review.rating,
      content: review.content,
      images: review.images ?? [],
      isAnonymous: review.isAnonymous,
      status: review.status,
      adminReply: review.adminReply,
      createdAt: review.createdAt,
    };
  }

  private toPublicVo(review: ProductReviewEntity, user?: UserEntity) {
    const nickname = review.isAnonymous
      ? '匿名用户'
      : user?.nickname || this.maskPhone(user?.phone) || '用户';
    return {
      id: Number(review.id),
      rating: review.rating,
      content: review.content,
      images: review.images ?? [],
      nickname,
      adminReply: review.adminReply,
      createdAt: review.createdAt,
    };
  }

  private maskPhone(phone?: string) {
    if (!phone || phone.length !== 11) return phone ?? '';
    return `${phone.slice(0, 3)}****${phone.slice(7)}`;
  }

  private async loadUserMap(userIds: string[]) {
    const unique = [...new Set(userIds)];
    if (!unique.length) return new Map<string, UserEntity>();
    const rows = await this.users.find({ where: { id: In(unique) } });
    return new Map(rows.map((u) => [u.id, u]));
  }
}
