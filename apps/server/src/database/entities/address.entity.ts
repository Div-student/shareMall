import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('address')
export class AddressEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ length: 50 })
  receiver!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ length: 50 })
  province!: string;

  @Column({ length: 50 })
  city!: string;

  @Column({ length: 50 })
  district!: string;

  @Column({ length: 255 })
  detail!: string;

  @Column({ name: 'is_default', default: false })
  isDefault!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
