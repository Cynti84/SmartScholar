import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateScholarshipsTable1768393448632
  implements MigrationInterface
{
  name = "UpdateScholarshipsTable1768393448632";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scholarships" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`
    );
    await queryRunner.query(
      `ALTER TABLE "scholarships" DROP COLUMN "fields_of_study"`
    );
    await queryRunner.query(
      `ALTER TABLE "scholarships" ADD "fields_of_study" jsonb NOT NULL DEFAULT '[]' `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "scholarships" DROP COLUMN "fields_of_study"`
    );
    await queryRunner.query(
      `ALTER TABLE "scholarships" ADD "fields_of_study" text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "scholarships" DROP COLUMN "created_at"`
    );
  }
}
