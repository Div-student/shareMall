import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_kyc')
export class UserKycEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'real_name', length: 50 })
  realName!: string;

  @Column({ name: 'id_card_no', length: 255 })
  idCardNo!: string;

  @Column({ type: 'enum', enum: ['pending', 'passed', 'rejected'], default: 'pending' })
  status!: 'pending' | 'passed' | 'rejected';

  @Column({ name: 'reject_reason', length: 255, nullable: true })
  rejectReason?: string;

  @Column({ name: 'audited_by', type: 'bigint', unsigned: true, nullable: true })
  auditedBy?: string;

  @Column({ name: 'audited_at', type: 'datetime', nullable: true })
  auditedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
