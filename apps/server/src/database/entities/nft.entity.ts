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

@Entity('nft')
export class NftEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ length: 255 })
  cover!: string;

  @Column({ length: 120, nullable: true })
  publisher?: string;

  @Column({ name: 'total_supply', default: 0 })
  totalSupply!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({
    name: 'exchange_fund',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  exchangeFund!: number;

  @Column({
    name: 'start_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  startPrice!: number;

  @Column({
    name: 'current_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: decimalTransformer,
  })
  currentPrice!: number;

  @Column({ name: 'last_price_date', type: 'date', nullable: true })
  lastPriceDate?: string;

  @Column({ name: 'limit_per_user', default: 0, comment: '0=不限' })
  limitPerUser!: number;

  @Column({ name: 'rights_desc', type: 'text', nullable: true })
  rightsDesc?: string;

  @Column({ type: 'enum', enum: ['on_sale', 'off_shelf'], default: 'off_shelf' })
  status!: 'on_sale' | 'off_shelf';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
