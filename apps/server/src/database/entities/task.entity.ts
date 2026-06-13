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

@Entity('task')
export class TaskEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 50 })
  name!: string;

  @Column({ type: 'enum', enum: ['sign', 'invite', 'first_order', 'share', 'browse'] })
  type!: 'sign' | 'invite' | 'first_order' | 'share' | 'browse';

  @Column({ name: 'reward_type', type: 'enum', enum: ['fund', 'other'], default: 'fund' })
  rewardType!: 'fund' | 'other';

  @Column({
    name: 'reward_value',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  rewardValue!: number;

  @Column({ type: 'json', nullable: true })
  rule?: Record<string, unknown> | null;

  @Column({ type: 'enum', enum: ['enabled', 'disabled'], default: 'enabled' })
  status!: 'enabled' | 'disabled';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
