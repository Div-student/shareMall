import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity('nft_trade')
export class NftTradeEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'listing_id', type: 'bigint', unsigned: true })
  listingId!: string;

  @Column({ name: 'buyer_id', type: 'bigint', unsigned: true })
  buyerId!: string;

  @Column({ name: 'seller_id', type: 'bigint', unsigned: true })
  sellerId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  price!: number;

  @Column({
    name: 'reference_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  referencePrice?: number;

  @Column({
    name: 'deal_premium_factor',
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
    transformer: decimalTransformer,
  })
  dealPremiumFactor?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  fee!: number;

  @Column({ name: 'seller_income', type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  sellerIncome!: number;

  @Column({ name: 'traded_at', type: 'datetime' })
  tradedAt!: Date;
}
