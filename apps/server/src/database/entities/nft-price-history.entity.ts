import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity('nft_price_history')
export class NftPriceHistoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'nft_id', type: 'bigint', unsigned: true })
  nftId!: string;

  @Column({ name: 'price_date', type: 'date' })
  priceDate!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  price!: number;

  @Column({
    name: 'change_pct',
    type: 'decimal',
    precision: 8,
    scale: 4,
    nullable: true,
    transformer: decimalTransformer,
  })
  changePct?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
