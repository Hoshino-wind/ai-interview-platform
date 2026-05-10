import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { SessionStatus } from '@ai-interview/shared-types';

@Entity('interview_sessions')
export class InterviewSession {
  @PrimaryColumn('varchar', { length: 64 })
  id!: string;

  @Column('varchar', { length: 64 })
  candidateId!: string;

  @Column('varchar', { length: 64 })
  positionId!: string;

  @Column('varchar', { length: 64 })
  questionPackageId!: string;

  @Column('varchar', { length: 32 })
  status!: SessionStatus;

  @Column('timestamp', { nullable: true })
  startedAt?: Date;

  @Column('timestamp', { nullable: true })
  endedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
