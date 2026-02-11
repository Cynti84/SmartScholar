import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedScholarshipViewTable1770831715309 implements MigrationInterface {
    name = 'AddedScholarshipViewTable1770831715309'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "scholarship_views" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "scholarshipId" integer NOT NULL, "viewedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5eb5c4c5119167c8b7be04b45df" UNIQUE ("userId", "scholarshipId"), CONSTRAINT "PK_4bcde6215bb46171c0e66caee35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "scholarship_views" ADD CONSTRAINT "FK_47b82b6bd6313e46c1985017c7a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "scholarship_views" ADD CONSTRAINT "FK_cc30c677451425b7823429cc192" FOREIGN KEY ("scholarshipId") REFERENCES "scholarships"("scholarship_id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scholarship_views" DROP CONSTRAINT "FK_cc30c677451425b7823429cc192"`);
        await queryRunner.query(`ALTER TABLE "scholarship_views" DROP CONSTRAINT "FK_47b82b6bd6313e46c1985017c7a"`);
        await queryRunner.query(`DROP TABLE "scholarship_views"`);
    }

}
