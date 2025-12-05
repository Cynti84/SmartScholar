import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTwoFactorSecretToUser1764926218734 implements MigrationInterface {
    name = 'AddTwoFactorSecretToUser1764926218734'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "twoFactorSecret" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "twoFactorSecret"`);
    }

}
