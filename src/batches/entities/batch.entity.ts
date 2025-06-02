import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Record } from '../../records/entities/record.entity';

@Entity('batches')
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  batch_name!: string;

  @Column()
  batch_type!: string;

  @Column({ default: 'Active' })
  status!: string;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  created_at!: Date;

  // Relations
  @OneToMany(() => Record, record => record.batch)
  records?: Record[];
}