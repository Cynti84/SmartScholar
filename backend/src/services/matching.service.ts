import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";
import { StudentProfile } from "../models/student_profiles";
import { MatchResult } from "../models/match_result";
import { INTEREST_CATEGORIES } from "../constants/interestCategories";

const scholarshipRepo = AppDataSource.getRepository(Scholarship);
const profileRepo = AppDataSource.getRepository(StudentProfile);
const matchRepo = AppDataSource.getRepository(MatchResult);

export class MatchingService {
  /**
   * Computes and stores fresh matches for a student.
   * Existing matches should already be cleared before calling this.
   */
  private async computeAndStoreMatches(studentId: number) {
    const profile = await profileRepo.findOne({
      where: { student_id: studentId },
    });

    if (!profile) {
      throw new Error("Student profile not found");
    }

    const interestCategory = profile.interest;

    const interestFields =
      interestCategory && INTEREST_CATEGORIES[interestCategory]
        ? INTEREST_CATEGORIES[interestCategory].map((f) => f.toLowerCase())
        : [];

    const scholarships = await scholarshipRepo
      .createQueryBuilder("s")
      .where("s.status = 'approved'")
      .andWhere("s.deadline >= CURRENT_DATE")
      .getMany();

    const results: MatchResult[] = [];

    for (const scholarship of scholarships) {
      let score = 0;

      // ===== Stage 1: Academic & interest matching =====

      // 1. Academic level match (strong)
      if (
        scholarship.education_level.toLowerCase() ===
        profile.academic_level.toLowerCase()
      ) {
        score += 40;
      }

      const scholarshipFields =
        scholarship.fields_of_study?.map((f) => f.toLowerCase()) || [];

      // 2. Field of study match (strong)
      if (
        profile.field_of_study &&
        scholarshipFields.includes(profile.field_of_study.toLowerCase())
      ) {
        score += 40;
      }

      // 3. Interest category match (supporting)
      if (interestFields.length > 0) {
        const hasInterestOverlap = scholarshipFields.some((f) =>
          interestFields.includes(f)
        );
        if (hasInterestOverlap) {
          score += 20;
        }
      }

      // Ignore weak matches
      if (score < 50) continue;

      // ===== Stage 2: Eligibility filtering =====

      // 1. Gender
      if (
        scholarship.eligibility_gender &&
        scholarship.eligibility_gender !== "any" &&
        scholarship.eligibility_gender !== profile.gender
      ) {
        continue;
      }

      // 2. Countries
      if (
        scholarship.eligibility_countries &&
        scholarship.eligibility_countries.length > 0 &&
        !scholarship.eligibility_countries.includes(profile.country)
      ) {
        continue;
      }

      // 3. Age
      if (profile.age) {
        if (scholarship.min_age && profile.age < scholarship.min_age) {
          continue;
        }
        if (scholarship.max_age && profile.age > scholarship.max_age) {
          continue;
        }
      }

      // 4. Education level allowed
      if (
        scholarship.education_level &&
        scholarship.education_level.length > 0 &&
        !scholarship.education_level.includes(profile.academic_level)
      ) {
        continue;
      }

      // 5. Disability requirement
      if (scholarship.requires_disability && !profile.is_disabled) {
        continue;
      }

      // 6. Income level (optional)
      if (
        scholarship.income_level &&
        scholarship.income_level !== "any" &&
        profile.income_level !== scholarship.income_level
      ) {
        continue;
      }

      // ===== Passed all filters – create match =====
      const match = matchRepo.create({
        student: { id: studentId } as any,
        scholarship: { scholarship_id: scholarship.scholarship_id } as any,
        match_score: score,
      });

      results.push(match);
    }

    if (results.length > 0) {
      await matchRepo.save(results);
    }

    return results;
  }

  /**
   * Public API – always returns fresh recommendations.
   */
  async getRecommendations(studentId: number) {
    // 1. Remove stale matches
    await matchRepo.delete({
      student: { id: studentId } as any,
    });

    // 2. Recompute matches
    await this.computeAndStoreMatches(studentId);

    // 3. Fetch fresh results
    return matchRepo
      .createQueryBuilder("m")
      .innerJoinAndSelect("m.scholarship", "s")
      .where("m.student_id = :studentId", { studentId })
      .andWhere("s.status = 'approved'")
      .andWhere("s.deadline >= CURRENT_DATE")
      .orderBy("m.match_score", "DESC")
      .getMany();
  }
}
