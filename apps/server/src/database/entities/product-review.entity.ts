import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product_review')
export class ProductReviewEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true })
  orderId!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'product_id', type: 'bigint', unsigned: true })
  productId!: string;

  @Column({ type: 'tinyint', unsigned: true })
  rating!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'json', nullable: true })
  images?: string[] | null;

  @Column({ name: 'is_anonymous', default: false })
  isAnonymous!: boolean;

  @Column({ type: 'enum', enum: ['shown', 'hidden'], default: 'shown' })
  status!: 'shown' | 'hidden';

  @Column({ name: 'admin_reply', type: 'varchar', length: 500, nullable: true })
  adminReply?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
