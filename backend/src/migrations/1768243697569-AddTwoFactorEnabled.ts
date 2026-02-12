import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTwoFactorEnabled1768243697569 implements MigrationInterface {
    name = 'AddTwoFactorEnabled1768243697569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "twoFactorEnabled" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twoFactorEnabled"`);
    }

}
