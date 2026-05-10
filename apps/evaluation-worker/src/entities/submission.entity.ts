import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';
import { AIPromptUsed, ContentType, EvaluationConfig } from '@ai-interview/shared-types';

@Entity('submissions')
@Index(['sessionId', 'versionNo'], { unique: true })
export class Submission {
  @PrimaryColumn('varchar', { length: 64 })
  id!: string;

  @Column('varchar', { length: 64 })
  sessionId!: string;

  @Column('varchar', { length: 64 })
  questionId!: string;

  @Column('integer')
  versionNo!: number;

  @Column('varchar', { length: 32 })
  contentType!: ContentType;

  @Column('text')
  contentRef!: string;

  @Column('varchar', { length: 32, nullable: true })
  language?: string;

  @Column('text', { nullable: true })
  thoughtProcess?: string;

  @Column('text', { nullable: true })
  iterationReason?: string;

  @Column('jsonb', { nullable: true })
  aiPromptsUsed?: AIPromptUsed[];

  @Column('jsonb', { nullable: true })
  evaluationConfig?: EvaluationConfig;

  @Column('text', { nullable: true })
  notes?: string;

  @CreateDateColumn()
  submittedAt!: Date;
}
