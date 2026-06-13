import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('operation_log')
export class OperationLogEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'admin_id', type: 'bigint', unsigned: true })
  adminId!: string;

  @Column({ type: 'varchar', length: 50 })
  module!: string;

  @Column({ type: 'varchar', length: 50 })
  action!: string;

  @Column({ type: 'json', nullable: true })
  detail?: object | null;

  @Column({ name: 'ip', type: 'varchar', length: 45, nullable: true })
  ip?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
