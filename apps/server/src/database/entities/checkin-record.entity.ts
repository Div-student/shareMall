import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity('checkin_record')
export class CheckinRecordEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'plan_id', type: 'bigint', unsigned: true })
  planId!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'day_index', type: 'int' })
  dayIndex!: number;

  @Column({ name: 'checkin_date', type: 'date' })
  checkinDate!: string;

  @Column({ type: 'enum', enum: ['signed', 'missed'] })
  status!: 'signed' | 'missed';

  @Column({ name: 'cashout_amount', type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  cashoutAmount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
