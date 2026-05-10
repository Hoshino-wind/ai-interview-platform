import { Column, CreateDateColumn, Entity, Index, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { EvaluationJobStatus } from '@shared/shared-types';

@Entity('evaluation_jobs')
@Index(['submissionId'], { unique: true })
export class EvaluationJob {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Column('varchar', { length: 64 })
  sessionId: string;

  @Column('varchar', { length: 64 })
  submissionId: string;

  @Column('varchar', { length: 32 })
  status: EvaluationJobStatus;

  @Column('varchar', { length: 128, nullable: true })
  idempotencyKey?: string;

  @Column('integer', { default: 0 })
  retryCount: number;

  @Column('text', { nullable: true })
  failureReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
