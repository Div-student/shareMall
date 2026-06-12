import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product')
export class ProductEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 120 })
  title!: string;

  @Column({ name: 'category_id', type: 'bigint', unsigned: true })
  categoryId!: string;

  @Column({ name: 'main_image', length: 255 })
  mainImage!: string;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @Column({ name: 'detail_html', type: 'mediumtext', nullable: true })
  detailHtml?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  price!: string;

  @Column({ name: 'market_price', type: 'decimal', precision: 12, scale: 2, nullable: true })
  marketPrice?: string;

  @Column({ name: 'fund_ratio', type: 'decimal', precision: 6, scale: 4, nullable: true })
  fundRatio?: string;

  @Column({ name: 'allow_fund_deduct', default: true })
  allowFundDeduct!: boolean;

  @Column({ name: 'deduct_limit_rate', type: 'decimal', precision: 6, scale: 4, nullable: true })
  deductLimitRate?: string;

  @Column({ default: 0 })
  sales!: number;

  @Column({ type: 'enum', enum: ['on_sale', 'off_shelf'], default: 'off_shelf' })
  status!: 'on_sale' | 'off_shelf';

  @Column({ default: 0 })
  sort!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
}
