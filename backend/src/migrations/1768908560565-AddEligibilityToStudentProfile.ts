import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEligibilityToStudentProfile1768908560565 implements MigrationInterface {
    name = 'AddEligibilityToStudentProfile1768908560565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_profiles" DROP COLUMN "financial_need"`);
        await queryRunner.query(`CREATE TYPE "public"."student_profiles_income_level_enum" AS ENUM('low', 'middle', 'any')`);
        await queryRunner.query(`ALTER TABLE "student_profiles" ADD "income_level" "public"."student_profiles_income_level_enum" DEFAULT 'any'`);
        await queryRunner.query(`ALTER TABLE "student_profiles" ADD "is_disabled" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_profiles" DROP COLUMN "is_disabled"`);
        await queryRunner.query(`ALTER TABLE "student_profiles" DROP COLUMN "income_level"`);
        await queryRunner.query(`DROP TYPE "public"."student_profiles_income_level_enum"`);
        await queryRunner.query(`ALTER TABLE "student_profiles" ADD "financial_need" boolean`);
    }

}
