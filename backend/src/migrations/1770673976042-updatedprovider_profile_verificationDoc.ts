import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedproviderProfileVerificationDoc1770673976042 implements MigrationInterface {
    name = 'UpdatedproviderProfileVerificationDoc1770673976042'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_profiles" DROP COLUMN "verification_docs"`);
        await queryRunner.query(`ALTER TABLE "provider_profiles" ADD "verification_docs" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_profiles" DROP COLUMN "verification_docs"`);
        await queryRunner.query(`ALTER TABLE "provider_profiles" ADD "verification_docs" text array`);
    }

}
