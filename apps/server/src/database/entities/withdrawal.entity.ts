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

@Entity('withdrawal')
export class WithdrawalEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  amount!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  fee!: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  actualAmount!: number;

  @Column({ type: 'enum', enum: ['bank', 'wechat', 'alipay'] })
  method!: 'bank' | 'wechat' | 'alipay';

  @Column({ name: 'account_info', type: 'json' })
  accountInfo!: Record<string, string>;

  @Column({
    type: 'enum',
    enum: ['pending', 'auditing', 'approved', 'paying', 'paid', 'rejected', 'failed'],
    default: 'pending',
  })
  status!: 'pending' | 'auditing' | 'approved' | 'paying' | 'paid' | 'rejected' | 'failed';

  @Column({ name: 'reject_reason', length: 255, nullable: true })
  rejectReason?: string;

  @Column({ name: 'audited_by', type: 'bigint', unsigned: true, nullable: true })
  auditedBy?: string;

  @Column({ name: 'paid_at', type: 'datetime', nullable: true })
  paidAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
