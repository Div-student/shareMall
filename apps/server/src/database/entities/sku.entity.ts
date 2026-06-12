import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sku')
export class SkuEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  productId!: string;

  @Column({ type: 'json' })
  spec!: Record<string, string>;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: string;

  @Column({ default: 0 })
  stock!: number;

  @Column({ name: 'sku_image', length: 255, nullable: true })
  skuImage?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
