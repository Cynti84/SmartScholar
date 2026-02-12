import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEligibilityToScholarships1768907725888 implements MigrationInterface {
    name = 'AddEligibilityToScholarships1768907725888'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookmark" DROP CONSTRAINT "FK_8b2b03e41a0b9096fe8fe84533b"`);
        await queryRunner.query(`ALTER TABLE "bookmark" DROP COLUMN "scholarshipScholarshipId"`);
        await queryRunner.query(`CREATE TYPE "public"."scholarships_eligibility_gender_enum" AS ENUM('male', 'female', 'any')`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "eligibility_gender" "public"."scholarships_eligibility_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "eligibility_countries" jsonb`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "min_age" integer`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "max_age" integer`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "eligible_education_levels" jsonb`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "requires_disability" boolean`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "income_level" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "scholarships" ALTER COLUMN "fields_of_study" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "bookmark" ADD CONSTRAINT "FK_7d45f1d48787231a040668ebd15" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("scholarship_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookmark" DROP CONSTRAINT "FK_7d45f1d48787231a040668ebd15"`);
        await queryRunner.query(`ALTER TABLE "scholarships" ALTER COLUMN "fields_of_study" SET DEFAULT '[]'`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "income_level"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "requires_disability"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "eligible_education_levels"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "max_age"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "min_age"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "eligibility_countries"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "eligibility_gender"`);
        await queryRunner.query(`DROP TYPE "public"."scholarships_eligibility_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "bookmark" ADD "scholarshipScholarshipId" integer`);
        await queryRunner.query(`ALTER TABLE "bookmark" ADD CONSTRAINT "FK_8b2b03e41a0b9096fe8fe84533b" FOREIGN KEY ("scholarshipScholarshipId") REFERENCES "scholarships"("scholarship_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
