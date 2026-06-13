import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('task_record')
export class TaskRecordEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'task_id', type: 'bigint', unsigned: true })
  taskId!: string;

  @Column({ type: 'enum', enum: ['ongoing', 'completed', 'claimed'], default: 'ongoing' })
  status!: 'ongoing' | 'completed' | 'claimed';

  @Column({ name: 'claimed_at', type: 'datetime', nullable: true })
  claimedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
