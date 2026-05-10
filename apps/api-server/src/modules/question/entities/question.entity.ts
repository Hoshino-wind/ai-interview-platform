import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  EvaluationConfig,
  QuestionParseResult,
  QuestionParseStatus,
  QuestionType,
} from '@shared/shared-types';

@Entity('questions')
export class Question {
  @PrimaryColumn('varchar', { length: 64 })
  id: string;

  @Column('varchar', { length: 200 })
  title: string;

  @Column('varchar', { length: 32 })
  type: QuestionType;

  @Column('text')
  stem: string;

  @Column('text', { nullable: true })
  rawContent?: string;

  @Column('varchar', { length: 32, default: 'markdown' })
  sourceFormat: 'markdown' | 'plain_text' | 'json';

  @Column('jsonb', { nullable: true })
  evaluationConfig?: EvaluationConfig;

  @Column('varchar', { length: 32 })
  parseStatus: QuestionParseStatus;

  @Column('jsonb', { nullable: true })
  parseResult?: QuestionParseResult;

  @Column('timestamp', { nullable: true })
  parseRequestedAt?: Date;

  @Column('timestamp', { nullable: true })
  parsedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
