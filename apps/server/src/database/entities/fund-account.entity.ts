import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity('fund_account')
export class FundAccountEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({
    name: 'pending_fund',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  pendingFund!: number;

  @Column({
    name: 'available_fund',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  availableFund!: number;

  @Column({
    name: 'withdrawable_cash',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  withdrawableCash!: number;

  @Column({
    name: 'frozen_cash',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  frozenCash!: number;

  @VersionColumn()
  version!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
