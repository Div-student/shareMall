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

@Entity('payment')
export class PaymentEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true })
  orderId!: string;

  @Column({ type: 'enum', enum: ['wechat', 'alipay'] })
  channel!: 'wechat' | 'alipay';

  @Column({ name: 'trade_no', length: 64, nullable: true, unique: true })
  tradeNo?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  amount!: number;

  @Column({ type: 'enum', enum: ['pending', 'success', 'failed'], default: 'pending' })
  status!: 'pending' | 'success' | 'failed';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
