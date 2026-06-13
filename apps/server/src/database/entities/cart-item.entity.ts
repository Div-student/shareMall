import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('cart_item')
export class CartItemEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  productId!: string;

  @Column({ name: 'sku_id', type: 'bigint', unsigned: true, nullable: true })
  skuId?: string;

  @Column({ default: 1 })
  quantity!: number;

  @Column({ default: true })
  checked!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
