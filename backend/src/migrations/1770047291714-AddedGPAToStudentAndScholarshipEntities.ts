import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedGPAToStudentAndScholarshipEntities1770047291714 implements MigrationInterface {
    name = 'AddedGPAToStudentAndScholarshipEntities1770047291714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scholarships" ADD "min_gpa" double precision`);
        await queryRunner.query(`ALTER TABLE "student_profiles" ADD "gpa_min" double precision`);
        await queryRunner.query(`ALTER TABLE "student_profiles" ADD "gpa_max" double precision`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_profiles" DROP COLUMN "gpa_max"`);
        await queryRunner.query(`ALTER TABLE "student_profiles" DROP COLUMN "gpa_min"`);
        await queryRunner.query(`ALTER TABLE "scholarships" DROP COLUMN "min_gpa"`);
    }

}
