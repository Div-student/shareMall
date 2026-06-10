import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('invite_relation')
export class InviteRelationEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'inviter_id', type: 'bigint', unsigned: true })
  inviterId!: string;

  @Column({ name: 'invitee_id', type: 'bigint', unsigned: true })
  inviteeId!: string;

  @Column({ name: 'invite_code', length: 20 })
  inviteCode!: string;

  @Column({
    name: 'reward_status',
    type: 'enum',
    enum: ['pending', 'granted', 'none'],
    default: 'pending',
  })
  rewardStatus!: 'pending' | 'granted' | 'none';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
