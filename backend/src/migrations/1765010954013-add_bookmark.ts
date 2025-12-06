import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBookmark1765010954013 implements MigrationInterface {
    name = 'AddBookmark1765010954013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bookmark" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "scholarshipId" integer NOT NULL, "status" character varying NOT NULL, "bookmarkedAt" TIMESTAMP NOT NULL DEFAULT now(), "scholarshipScholarshipId" integer, CONSTRAINT "PK_b7fbf4a865ba38a590bb9239814" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bookmark" ADD CONSTRAINT "FK_e389fc192c59bdce0847ef9ef8b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookmark" ADD CONSTRAINT "FK_8b2b03e41a0b9096fe8fe84533b" FOREIGN KEY ("scholarshipScholarshipId") REFERENCES "scholarships"("scholarship_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookmark" DROP CONSTRAINT "FK_8b2b03e41a0b9096fe8fe84533b"`);
        await queryRunner.query(`ALTER TABLE "bookmark" DROP CONSTRAINT "FK_e389fc192c59bdce0847ef9ef8b"`);
        await queryRunner.query(`DROP TABLE "bookmark"`);
    }

}
