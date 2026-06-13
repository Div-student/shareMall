import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_nft')
export class UserNftEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'nft_id', type: 'bigint', unsigned: true })
  nftId!: string;

  @Column({ name: 'serial_no', length: 64 })
  serialNo!: string;

  @Column({ type: 'enum', enum: ['exchange', 'trade_buy', 'transfer'] })
  source!: 'exchange' | 'trade_buy' | 'transfer';

  @Column({ type: 'enum', enum: ['holding', 'listed', 'sold', 'transferred'], default: 'holding' })
  status!: 'holding' | 'listed' | 'sold' | 'transferred';

  @Column({ name: 'acquired_at', type: 'datetime' })
  acquiredAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
