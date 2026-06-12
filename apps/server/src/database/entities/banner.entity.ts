import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('banner')
export class BannerEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ type: 'enum', enum: ['home_top', 'home_grid', 'activity'], default: 'home_top' })
  position!: 'home_top' | 'home_grid' | 'activity';

  @Column({ length: 255 })
  image!: string;

  @Column({ length: 255, nullable: true })
  link?: string;

  @Column({ default: 0 })
  sort!: number;

  @Column({ name: 'start_at', type: 'datetime', nullable: true })
  startAt?: Date;

  @Column({ name: 'end_at', type: 'datetime', nullable: true })
  endAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
