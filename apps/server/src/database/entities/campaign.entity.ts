import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('campaign')
export class CampaignEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 128 })
  title!: string;

  @Column({ length: 255, nullable: true })
  subtitle?: string;

  @Column({ length: 512, nullable: true })
  banner?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'enum', enum: ['promotion', 'discount', 'nft', 'general'], default: 'general' })
  type!: 'promotion' | 'discount' | 'nft' | 'general';

  @Column({ type: 'json', nullable: true })
  rule?: Record<string, unknown>;

  @Column({ type: 'enum', enum: ['draft', 'active', 'ended'], default: 'draft' })
  status!: 'draft' | 'active' | 'ended';

  @Column({ name: 'participant_count', type: 'int', unsigned: true, default: 0 })
  participantCount!: number;

  @Column({ name: 'start_at', type: 'datetime', nullable: true })
  startAt?: Date;

  @Column({ name: 'end_at', type: 'datetime', nullable: true })
  endAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
