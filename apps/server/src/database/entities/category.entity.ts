import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('category')
export class CategoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'parent_id', type: 'bigint', unsigned: true, default: 0 })
  parentId!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ length: 255, nullable: true })
  icon?: string;

  @Column({ default: 0 })
  sort!: number;

  @Column({ name: 'fund_ratio', type: 'decimal', precision: 6, scale: 4, nullable: true })
  fundRatio?: string;

  @Column({ type: 'enum', enum: ['show', 'hidden'], default: 'show' })
  status!: 'show' | 'hidden';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
