import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateQuestionsTable1713500002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'questions',
        columns: [
          { name: 'id', type: 'varchar', length: '64', isPrimary: true },
          { name: 'title', type: 'varchar', length: '200' },
          { name: 'type', type: 'varchar', length: '32' },
          { name: 'stem', type: 'text' },
          { name: 'rawContent', type: 'text', isNullable: true },
          { name: 'sourceFormat', type: 'varchar', length: '32', default: `'markdown'` },
          { name: 'evaluationConfig', type: 'jsonb', isNullable: true },
          { name: 'parseStatus', type: 'varchar', length: '32' },
          { name: 'parseResult', type: 'jsonb', isNullable: true },
          { name: 'parseRequestedAt', type: 'timestamp', isNullable: true },
          { name: 'parsedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('questions');
  }
}
