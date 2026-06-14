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

@Entity('coupon')
export class CouponEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 64 })
  name!: string;

  @Column({ type: 'enum', enum: ['fixed', 'discount'], default: 'fixed' })
  type!: 'fixed' | 'discount';

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  value!: number;

  @Column({ name: 'min_amount', type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  minAmount!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  total!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  claimed!: number;

  @Column({ type: 'int', unsigned: true, default: 0 })
  used!: number;

  @Column({ type: 'enum', enum: ['enabled', 'disabled'], default: 'enabled' })
  status!: 'enabled' | 'disabled';

  @Column({ name: 'start_at', type: 'datetime', nullable: true })
  startAt?: Date;

  @Column({ name: 'end_at', type: 'datetime', nullable: true })
  endAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
