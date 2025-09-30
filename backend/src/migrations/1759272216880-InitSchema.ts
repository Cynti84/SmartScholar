import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1759272216880 implements MigrationInterface {
    name = 'InitSchema1759272216880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "match_results" ("match_id" SERIAL NOT NULL, "match_score" numeric(5,2), "student_id" integer, "scholarship_id" integer, CONSTRAINT "PK_e9d504d20c43a4b5cdb355e7f8e" PRIMARY KEY ("match_id"))`);
        await queryRunner.query(`CREATE TABLE "scholarships" ("scholarship_id" SERIAL NOT NULL, "provider_id" integer, "title" character varying(150) NOT NULL, "description" text, "requirements" text, "deadline" date, "status" character varying(20) NOT NULL DEFAULT 'open', CONSTRAINT "PK_c4b705fbb523164309ef95e9038" PRIMARY KEY ("scholarship_id"))`);
        await queryRunner.query(`CREATE TABLE "applications" ("application_id" SERIAL NOT NULL, "student_id" integer, "scholarship_id" integer, "application_date" TIMESTAMP NOT NULL DEFAULT now(), "status" character varying(20) NOT NULL DEFAULT 'pending', "applied" boolean NOT NULL DEFAULT false, "proof_of_application" text, CONSTRAINT "CHK_c5fa9d0697fa596c3d42f9bcb9" CHECK ("status" IN ('pending', 'accepted', 'rejected')), CONSTRAINT "PK_418038704e50c663590feb7f511" PRIMARY KEY ("application_id"))`);
        await queryRunner.query(`CREATE TABLE "student_profiles" ("student_id" integer NOT NULL, "date_of_birth" date, "nationality" character varying(100), "academic_level" character varying(50), "gpa" numeric(3,2), "field_of_study" character varying(100), "other_info" text, CONSTRAINT "PK_4cedc08d3dc1f2c2da8a12f7a88" PRIMARY KEY ("student_id"))`);
        await queryRunner.query(`CREATE TABLE "provider_profiles" ("provider_id" integer NOT NULL, "organization_name" character varying(150) NOT NULL, "contact_info" character varying(150), "logo_url" text, "verified" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_ea1b888a2ff334dd81fd4b28acf" PRIMARY KEY ("provider_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('student', 'provider', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("user_id" SERIAL NOT NULL, "full_name" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_96aac72f1574b88752e9fb00089" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_fa9e3c36a9ac8160ec55c86aea8" FOREIGN KEY ("student_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_9c6f230d6d0d998eca0f4436ba5" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("scholarship_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "scholarships" ADD CONSTRAINT "FK_2864732e8c00c5de7fa0439d228" FOREIGN KEY ("provider_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_791e5e9cf054d0295ebfe4491a9" FOREIGN KEY ("student_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "applications" ADD CONSTRAINT "FK_19103ddfe2610d246f765611ebd" FOREIGN KEY ("scholarship_id") REFERENCES "scholarships"("scholarship_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_4cedc08d3dc1f2c2da8a12f7a88" FOREIGN KEY ("student_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "provider_profiles" ADD CONSTRAINT "FK_ea1b888a2ff334dd81fd4b28acf" FOREIGN KEY ("provider_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_profiles" DROP CONSTRAINT "FK_ea1b888a2ff334dd81fd4b28acf"`);
        await queryRunner.query(`ALTER TABLE "student_profiles" DROP CONSTRAINT "FK_4cedc08d3dc1f2c2da8a12f7a88"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_19103ddfe2610d246f765611ebd"`);
        await queryRunner.query(`ALTER TABLE "applications" DROP CONSTRAINT "FK_791e5e9cf054d0295ebfe4491a9"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP CONSTRAINT "FK_2864732e8c00c5de7fa0439d228"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT "FK_9c6f230d6d0d998eca0f4436ba5"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT "FK_fa9e3c36a9ac8160ec55c86aea8"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "provider_profiles"`);
        await queryRunner.query(`DROP TABLE "student_profiles"`);
        await queryRunner.query(`DROP TABLE "applications"`);
        await queryRunner.query(`DROP TABLE "scholarships"`);
        await queryRunner.query(`DROP TABLE "match_results"`);
    }

}
