import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity('fund_record')
export class FundRecordEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({
    name: 'asset_type',
    type: 'enum',
    enum: ['pending_fund', 'available_fund', 'withdrawable_cash'],
  })
  assetType!: 'pending_fund' | 'available_fund' | 'withdrawable_cash';

  @Column({
    name: 'change_type',
    type: 'enum',
    enum: [
      'order_accrue',
      'checkin_start',
      'checkin_cashout',
      'order_deduct',
      'nft_exchange',
      'nft_trade_buy',
      'nft_trade_income',
      'aftersale_void',
      'aftersale_rollback',
      'withdraw',
      'task_reward',
    ],
  })
  changeType!:
    | 'order_accrue'
    | 'checkin_start'
    | 'checkin_cashout'
    | 'order_deduct'
    | 'nft_exchange'
    | 'nft_trade_buy'
    | 'nft_trade_income'
    | 'aftersale_void'
    | 'aftersale_rollback'
    | 'withdraw'
    | 'task_reward';

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  amount!: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  balanceAfter!: number;

  @Column({ name: 'ref_type', type: 'enum', enum: ['order', 'checkin', 'nft', 'withdraw', 'task'], nullable: true })
  refType?: 'order' | 'checkin' | 'nft' | 'withdraw' | 'task';

  @Column({ name: 'ref_id', type: 'bigint', unsigned: true, nullable: true })
  refId?: string;

  @Column({ length: 255, nullable: true })
  remark?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
