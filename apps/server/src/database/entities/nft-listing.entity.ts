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

@Entity('nft_listing')
export class NftListingEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_nft_id', type: 'bigint', unsigned: true })
  userNftId!: string;

  @Column({ name: 'seller_id', type: 'bigint', unsigned: true })
  sellerId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  price!: number;

  @Column({ name: 'fee_rate', type: 'decimal', precision: 6, scale: 4, transformer: decimalTransformer })
  feeRate!: number;

  @Column({ type: 'enum', enum: ['listing', 'sold', 'cancelled', 'removed'], default: 'listing' })
  status!: 'listing' | 'sold' | 'cancelled' | 'removed';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
