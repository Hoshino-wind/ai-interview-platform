import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSubmissionEvaluationConfig1713500001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'submissions',
      new TableColumn({
        name: 'evaluationConfig',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('submissions', 'evaluationConfig');
  }
}
