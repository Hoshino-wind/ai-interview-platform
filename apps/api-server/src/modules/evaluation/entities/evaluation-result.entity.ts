import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('evaluation_results')
@Index(['evaluationJobId'], { unique: true })
export class EvaluationResult {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Column('varchar', { length: 64 })
  sessionId: string;

  @Column('varchar', { length: 64 })
  submissionId: string;

  @Column('varchar', { length: 64 })
  evaluationJobId: string;

  @Column('integer')
  autoScore: number;

  @Column('boolean')
  gatePass: boolean;

  @Column('jsonb')
  metrics: Record<string, unknown>;

  @Column('jsonb', { nullable: true })
  gateFlags?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
