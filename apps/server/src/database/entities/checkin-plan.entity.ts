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

@Entity('checkin_plan')
export class CheckinPlanEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ type: 'int' })
  tier!: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  totalAmount!: number;

  @Column({ name: 'daily_amount', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  dailyAmount!: number;

  @Column({ name: 'total_days', type: 'int', default: 30 })
  totalDays!: number;

  @Column({ name: 'signed_days', type: 'int', default: 0 })
  signedDays!: number;

  @Column({ name: 'cashed_amount', type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  cashedAmount!: number;

  @Column({ name: 'void_amount', type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  voidAmount!: number;

  @Column({ type: 'enum', enum: ['active', 'completed', 'terminated'], default: 'active' })
  status!: 'active' | 'completed' | 'terminated';

  @Column({ name: 'started_at', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
