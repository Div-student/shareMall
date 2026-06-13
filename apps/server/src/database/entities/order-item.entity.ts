import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

const decimalTransformer = {
  to: (value: number) => value,
  from: (value: string) => Number(value),
};

@Entity('order_item')
export class OrderItemEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true })
  orderId!: string;

  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  productId!: string;

  @Column({ name: 'sku_id', type: 'bigint', unsigned: true, nullable: true })
  skuId?: string;

  @Column({ name: 'product_snapshot', type: 'json' })
  productSnapshot!: Record<string, unknown>;

  @Column({ type: 'decimal', precision: 12, scale: 2, transformer: decimalTransformer })
  price!: number;

  @Column()
  quantity!: number;

  @Column({ name: 'item_fund', type: 'decimal', precision: 12, scale: 2, default: 0, transformer: decimalTransformer })
  itemFund!: number;
}
