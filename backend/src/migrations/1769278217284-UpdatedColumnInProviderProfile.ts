import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedColumnInProviderProfile1769278217284 implements MigrationInterface {
    name = 'UpdatedColumnInProviderProfile1769278217284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_profiles" RENAME COLUMN "verification_document_url" TO "verification_docs"`);
        await queryRunner.query(`ALTER TABLE "provider_profiles" DROP COLUMN "verification_docs"`);
        await queryRunner.query(`ALTER TABLE "provider_profiles" ADD "verification_docs" text array`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "provider_profiles" DROP COLUMN "verification_docs"`);
        await queryRunner.query(`ALTER TABLE "provider_profiles" ADD "verification_docs" text`);
        await queryRunner.query(`ALTER TABLE "provider_profiles" RENAME COLUMN "verification_docs" TO "verification_document_url"`);
    }

}
