import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailPreferences1768287514142 implements MigrationInterface {
    name = 'CreateEmailPreferences1768287514142'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_preferences" ("email_id" SERIAL NOT NULL, "scholarshipAlerts" boolean NOT NULL DEFAULT true, "applicationUpdates" boolean NOT NULL DEFAULT true, "weeklyDigest" boolean NOT NULL DEFAULT false, "newScholarships" boolean NOT NULL DEFAULT true, "deadlineReminders" boolean NOT NULL DEFAULT true, "marketingEmails" boolean NOT NULL DEFAULT false, "user_id" integer, CONSTRAINT "REL_f19292146419a50d1e9d8c80b5" UNIQUE ("user_id"), CONSTRAINT "PK_7f13136dc3b62c51002d7d1e1e4" PRIMARY KEY ("email_id"))`);
        await queryRunner.query(`ALTER TABLE "email_preferences" ADD CONSTRAINT "FK_f19292146419a50d1e9d8c80b54" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_preferences" DROP CONSTRAINT "FK_f19292146419a50d1e9d8c80b54"`);
        await queryRunner.query(`DROP TABLE "email_preferences"`);
    }

}
