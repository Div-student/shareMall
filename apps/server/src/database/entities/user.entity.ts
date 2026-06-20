import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ name: 'password_hash', length: 100 })
  passwordHash!: string;

  @Column({ length: 50, nullable: true })
  nickname?: string;

  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @Column({ type: 'enum', enum: ['unknown', 'male', 'female'], default: 'unknown' })
  gender!: 'unknown' | 'male' | 'female';

  @Column({ type: 'date', nullable: true })
  birthday?: string;

  @Column({ type: 'enum', enum: ['normal', 'frozen', 'blacklist'], default: 'normal' })
  status!: 'normal' | 'frozen' | 'blacklist';

  @Column({
    name: 'kyc_status',
    type: 'enum',
    enum: ['none', 'pending', 'passed', 'rejected'],
    default: 'none',
  })
  kycStatus!: 'none' | 'pending' | 'passed' | 'rejected';

  @Column({ name: 'invite_code', length: 20 })
  inviteCode!: string;

  @Column({ name: 'inviter_id', type: 'bigint', unsigned: true, nullable: true })
  inviterId?: string;

  @Column({ name: 'register_ip', length: 45, nullable: true })
  registerIp?: string;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
