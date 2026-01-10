import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateScholarshipEntity1767872683364 implements MigrationInterface {
    name = 'UpdateScholarshipEntity1767872683364'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scholarships" DROP CONSTRAINT "FK_2864732e8c00c5de7fa0439d228"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "requirements"`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "organization_name" character varying(150) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "short_summary" character varying(200) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "eligibility_criteria" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "benefits" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "country" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "education_level" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "scholarship_type" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "fields_of_study" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "application_link" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "application_instructions" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "contact_email" character varying`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "contact_phone" character varying`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "flyer_url" character varying`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "banner_url" character varying`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "verification_docs" jsonb`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "admin_notes" text`);
        await queryRunner.query(`ALTER TABLE "scholarships" ALTER COLUMN "description" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ALTER COLUMN "deadline" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."scholarships_status_enum" AS ENUM('draft', 'pending', 'approved', 'rejected', 'published')`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "status" "public"."scholarships_status_enum" NOT NULL DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD CONSTRAINT "FK_2864732e8c00c5de7fa0439d228" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scholarships" DROP CONSTRAINT "FK_2864732e8c00c5de7fa0439d228"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."scholarships_status_enum"`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "status" character varying(20) NOT NULL DEFAULT 'open'`);
        await queryRunner.query(`ALTER TABLE "scholarships" ALTER COLUMN "deadline" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" ALTER COLUMN "description" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "admin_notes"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "verification_docs"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "banner_url"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "flyer_url"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "contact_phone"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "contact_email"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "application_instructions"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "application_link"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "fields_of_study"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "scholarship_type"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "education_level"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "country"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "benefits"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "eligibility_criteria"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "short_summary"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "organization_name"`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "requirements" text`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD CONSTRAINT "FK_2864732e8c00c5de7fa0439d228" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

}
