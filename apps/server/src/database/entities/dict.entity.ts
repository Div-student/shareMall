import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('dict')
export class DictEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ length: 40 })
  group!: string;

  @Column({ length: 40 })
  code!: string;

  @Column({ length: 128 })
  label!: string;

  @Column({ type: 'int', default: 0 })
  sort!: number;

  @Column({ type: 'enum', enum: ['enabled', 'disabled'], default: 'enabled' })
  status!: 'enabled' | 'disabled';

  @Column({ length: 255, nullable: true })
  remark?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
