import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_coupon')
export class UserCouponEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'coupon_id', type: 'bigint', unsigned: true })
  couponId!: string;

  @Column({ type: 'enum', enum: ['unused', 'used', 'expired'], default: 'unused' })
  status!: 'unused' | 'used' | 'expired';

  @Column({ name: 'order_id', type: 'bigint', unsigned: true, nullable: true })
  orderId?: string;

  @Column({ name: 'claimed_at', type: 'datetime' })
  claimedAt!: Date;

  @Column({ name: 'used_at', type: 'datetime', nullable: true })
  usedAt?: Date;
}
