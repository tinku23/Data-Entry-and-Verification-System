import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Batch } from '../../batches/entities/batch.entity';
import { AuditLog } from '../../audit-logs/entities/audit-log.entity';

@Entity('records')
@Index(['apn'])
@Index(['borrower_name'])
@Index(['property_address'])
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  property_address!: string;

  @Column('date')
  transaction_date!: Date;

  @Column()
  borrower_name!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  loan_amount!: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  sales_price?: number;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  down_payment?: number;

  @Column({ nullable: true })
  apn?: string;

  @Column({ default: 'Pending' })
  status!: string;

  @Column({ nullable: true })
  locked_by?: string;

  @Column({ type: 'timestamp', nullable: true })
  lock_timestamp?: Date;

  @Column()
  entered_by!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  entered_by_date!: Date;

  @Column({ nullable: true })
  reviewed_by?: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_by_date?: Date;

  @Column({ nullable: true })
  loan_officer_name?: string;

  @Column({ nullable: true })
  nmls_id?: string;

  @Column({ type: 'int', nullable: true })
  loan_term?: number;

  @Column({ nullable: true })
  source_image_url?: string;

  @Column({ nullable: true })
  county_website_url?: string;

  @Column('uuid', { nullable: true })
  batch_id?: string;

  @Column({ type: 'text', nullable: true })
  search_vector?: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  // Relations
  @ManyToOne(() => Batch, batch => batch.records, { nullable: true })
  @JoinColumn({ name: 'batch_id' })
  batch?: Batch;

  @OneToMany(() => AuditLog, auditLog => auditLog.record)
  audit_logs?: AuditLog[];
}