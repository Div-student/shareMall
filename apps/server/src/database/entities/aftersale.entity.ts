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

@Entity('aftersale')
export class AftersaleEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true })
  orderId!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ type: 'enum', enum: ['refund_only', 'return_refund'] })
  type!: 'refund_only' | 'return_refund';

  @Column({ length: 255 })
  reason!: string;

  @Column({ type: 'json', nullable: true })
  evidence?: string[] | null;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  refundAmount!: number;

  @Column({ name: 'fund_rollback', type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  fundRollback!: number;

  @Column({ name: 'fund_void', type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  fundVoid!: number;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected', 'refunded'], default: 'pending' })
  status!: 'pending' | 'approved' | 'rejected' | 'refunded';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
