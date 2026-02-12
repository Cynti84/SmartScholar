import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMatchExplainability1769602446122 implements MigrationInterface {
    name = 'AddMatchExplainability1769602446122'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_results" ADD "matched_criteria" jsonb`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD "unmatched_criteria" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "match_results" DROP COLUMN "unmatched_criteria"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP COLUMN "matched_criteria"`);
    }

}
