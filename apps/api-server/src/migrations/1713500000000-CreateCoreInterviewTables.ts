import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateCoreInterviewTables1713500000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'interview_sessions',
        columns: [
          { name: 'id', type: 'varchar', length: '64', isPrimary: true },
          { name: 'candidateId', type: 'varchar', length: '64' },
          { name: 'positionId', type: 'varchar', length: '64' },
          { name: 'questionPackageId', type: 'varchar', length: '64' },
          { name: 'status', type: 'varchar', length: '32' },
          { name: 'startedAt', type: 'timestamp', isNullable: true },
          { name: 'endedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createIndex(
      'interview_sessions',
      new TableIndex({
        name: 'IDX_interview_sessions_candidate_status',
        columnNames: ['candidateId', 'status'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'submissions',
        columns: [
          { name: 'id', type: 'varchar', length: '64', isPrimary: true },
          { name: 'sessionId', type: 'varchar', length: '64' },
          { name: 'questionId', type: 'varchar', length: '64' },
          { name: 'versionNo', type: 'integer' },
          { name: 'contentType', type: 'varchar', length: '32' },
          { name: 'contentRef', type: 'text' },
          { name: 'language', type: 'varchar', length: '32', isNullable: true },
          { name: 'thoughtProcess', type: 'text', isNullable: true },
          { name: 'iterationReason', type: 'text', isNullable: true },
          { name: 'aiPromptsUsed', type: 'jsonb', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'submittedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'submissions',
      new TableForeignKey({
        columnNames: ['sessionId'],
        referencedTableName: 'interview_sessions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'submissions',
      new TableIndex({
        name: 'IDX_submissions_session_version_unique',
        columnNames: ['sessionId', 'versionNo'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'submissions',
      new TableIndex({
        name: 'IDX_submissions_submitted_at',
        columnNames: ['submittedAt'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'evaluation_jobs',
        columns: [
          { name: 'id', type: 'varchar', length: '64', isPrimary: true },
          { name: 'sessionId', type: 'varchar', length: '64' },
          { name: 'submissionId', type: 'varchar', length: '64' },
          { name: 'status', type: 'varchar', length: '32' },
          { name: 'idempotencyKey', type: 'varchar', length: '128', isNullable: true },
          { name: 'retryCount', type: 'integer', default: 0 },
          { name: 'failureReason', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'evaluation_jobs',
      new TableForeignKey({
        columnNames: ['sessionId'],
        referencedTableName: 'interview_sessions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'evaluation_jobs',
      new TableForeignKey({
        columnNames: ['submissionId'],
        referencedTableName: 'submissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'evaluation_jobs',
      new TableIndex({
        name: 'IDX_evaluation_jobs_submission_unique',
        columnNames: ['submissionId'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'evaluation_jobs',
      new TableIndex({
        name: 'IDX_evaluation_jobs_idempotency_key',
        columnNames: ['idempotencyKey'],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'evaluation_results',
        columns: [
          { name: 'id', type: 'varchar', length: '64', isPrimary: true },
          { name: 'sessionId', type: 'varchar', length: '64' },
          { name: 'submissionId', type: 'varchar', length: '64' },
          { name: 'evaluationJobId', type: 'varchar', length: '64' },
          { name: 'autoScore', type: 'integer' },
          { name: 'gatePass', type: 'boolean' },
          { name: 'metrics', type: 'jsonb' },
          { name: 'gateFlags', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'evaluation_results',
      new TableForeignKey({
        columnNames: ['sessionId'],
        referencedTableName: 'interview_sessions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'evaluation_results',
      new TableForeignKey({
        columnNames: ['submissionId'],
        referencedTableName: 'submissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'evaluation_results',
      new TableForeignKey({
        columnNames: ['evaluationJobId'],
        referencedTableName: 'evaluation_jobs',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'evaluation_results',
      new TableIndex({
        name: 'IDX_evaluation_results_job_unique',
        columnNames: ['evaluationJobId'],
        isUnique: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('evaluation_results');
    await queryRunner.dropTable('evaluation_jobs');
    await queryRunner.dropTable('submissions');
    await queryRunner.dropTable('interview_sessions');
  }
}
