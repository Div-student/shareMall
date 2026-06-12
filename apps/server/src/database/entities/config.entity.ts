import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('config')
export class ConfigEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 30 })
  group!: string;

  @Column({ length: 60 })
  key!: string;

  @Column({ type: 'json' })
  value!: Record<string, unknown>;

  @Column({ name: 'effective_at', type: 'datetime', nullable: true })
  effectiveAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
