import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Record } from '../../records/entities/record.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  record_id!: string;

  @Column()
  user_id!: string;

  @Column()
  action!: string;

  @Column({ nullable: true })
  field_name?: string;

  @Column({ type: 'text', nullable: true })
  old_value?: string;

  @Column({ type: 'text', nullable: true })
  new_value?: string;

  @Column({ nullable: true })
  ip_address?: string;

  @Column({ nullable: true })
  user_agent?: string;

  @CreateDateColumn()
  timestamp!: Date;

  // Relations
  @ManyToOne(() => Record, record => record.audit_logs)
  @JoinColumn({ name: 'record_id' })
  record!: Record;
}
