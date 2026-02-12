import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProviderPreferences1770885298250 implements MigrationInterface {
    name = 'AddProviderPreferences1770885298250'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_profiles" ADD "preferences" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_profiles" DROP COLUMN "preferences"`);
    }

}
