import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity('order')
export class OrderEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'order_no', length: 32, unique: true })
  orderNo!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'address_snapshot', type: 'json' })
  addressSnapshot!: Record<string, unknown>;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  totalAmount!: number;

  @Column({
    name: 'fund_deduct_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  fundDeductAmount!: number;

  @Column({
    name: 'coupon_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  couponAmount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  freight!: number;

  @Column({ name: 'pay_amount', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  payAmount!: number;

  @Column({
    name: 'accrued_fund',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  accruedFund!: number;

  @Column({
    type: 'enum',
    enum: ['unpaid', 'paid', 'shipped', 'received', 'completed', 'closed'],
    default: 'unpaid',
  })
  status!: 'unpaid' | 'paid' | 'shipped' | 'received' | 'completed' | 'closed';

  @Column({ name: 'pay_method', type: 'enum', enum: ['wechat', 'alipay', 'balance'], nullable: true })
  payMethod?: 'wechat' | 'alipay' | 'balance';

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt?: Date;

  @Column({ name: 'shipped_at', type: 'datetime', nullable: true })
  shippedAt?: Date;

  @Column({ name: 'received_at', type: 'datetime', nullable: true })
  receivedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
