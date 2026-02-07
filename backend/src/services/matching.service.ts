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
      const matchedCriteria: string[] = [];
      const unmatchedCriteria: string[] = [];

      // ===== Stage 1: Academic & interest matching =====

      // 1. Academic level
      if (
        scholarship.education_level.toLowerCase() ===
        profile.academic_level.toLowerCase()
      ) {
        score += 40;
        matchedCriteria.push("Academic level matches your profile");
      } else {
        unmatchedCriteria.push("Academic level does not match");
      }

      const scholarshipFields =
        scholarship.fields_of_study?.map((f) => f.toLowerCase()) || [];

      // 2. Field of study
      if (
        profile.field_of_study &&
        scholarshipFields.includes(profile.field_of_study.toLowerCase())
      ) {
        score += 40;
        matchedCriteria.push(
          `Field of study matches (${profile.field_of_study})`
        );
      } else {
        unmatchedCriteria.push("Field of study does not match");
      }

      // 3. Interest category
      if (interestFields.length > 0) {
        const hasInterestOverlap = scholarshipFields.some((f) =>
          interestFields.includes(f)
        );

        if (hasInterestOverlap) {
          score += 20;
          matchedCriteria.push("Matches your interest category");
        } else {
          unmatchedCriteria.push("Does not match your interest category");
        }
      }

      // ===== Stage 2: Eligibility filtering =====

      // 1. Gender
      if (
        scholarship.eligibility_gender &&
        scholarship.eligibility_gender !== "any"
      ) {
        if (scholarship.eligibility_gender !== profile.gender) {
          unmatchedCriteria.push("Gender requirement not met");
          continue;
        } else {
          score += 10;
          matchedCriteria.push("Gender requirement met");
        }
      }

      // 2. Country
      if (
        scholarship.eligibility_countries &&
        scholarship.eligibility_countries.length > 0
      ) {
        if (!scholarship.eligibility_countries.includes(profile.country)) {
          unmatchedCriteria.push("Country requirement not met");
          continue;
        } else {
          score += 10;
          matchedCriteria.push(`Eligible country: ${profile.country}`);
        }
      }

      // 3. Age
      if (profile.age) {
        if (scholarship.min_age && profile.age < scholarship.min_age) {
          unmatchedCriteria.push("Minimum age requirement not met");
          continue;
        }

        if (scholarship.max_age && profile.age > scholarship.max_age) {
          unmatchedCriteria.push("Maximum age requirement exceeded");
          continue;
        }

        score += 5;
        matchedCriteria.push("Age requirement met");
      }

      // 4. Education level allowed
      if (
        scholarship.education_level &&
        scholarship.education_level.length > 0
      ) {
        if (!scholarship.education_level.includes(profile.academic_level)) {
          unmatchedCriteria.push("Education level not eligible");
          continue;
        } else {
          score += 10;
          matchedCriteria.push("Education level eligible");
        }
      }

      // 5. Disability
      if (scholarship.requires_disability) {
        if (!profile.is_disabled) {
          unmatchedCriteria.push("Disability requirement not met");
          continue;
        } else {
          score += 10;
          matchedCriteria.push("Disability requirement met");
        }
      }

      // 6. Income level
      if (scholarship.income_level && scholarship.income_level !== "any") {
        if (profile.income_level !== scholarship.income_level) {
          unmatchedCriteria.push("Income level requirement not met");
          continue;
        } else {
          score += 10;
          matchedCriteria.push("Income level matches eligibility");
        }
      }

      // 7. GPA requirement
      if (scholarship.min_gpa !== null && scholarship.min_gpa !== undefined) {
        // Student did not provide GPA
        if (
          profile.gpa_min === null ||
          profile.gpa_min === undefined ||
          profile.gpa_max === null ||
          profile.gpa_max === undefined
        ) {
          // Soft penalty – unclear eligibility
          unmatchedCriteria.push(
            `Minimum GPA required (${scholarship.min_gpa}), but your GPA was not provided`
          );
          score -= 5;
        } else {
          // Student GPA range below requirement
          if (profile.gpa_max < scholarship.min_gpa) {
            unmatchedCriteria.push(
              `Minimum GPA requirement (${scholarship.min_gpa}) not met`
            );
            continue; // hard fail
          }

          // Student GPA meets or exceeds requirement
          score += 15;
          matchedCriteria.push(
            `GPA requirement met (minimum ${scholarship.min_gpa})`
          );
        }
      }

      // Ignore weak matches
      if (score < 55) continue;

      const match = matchRepo.create({
        student: { id: studentId } as any,
        scholarship: { scholarship_id: scholarship.scholarship_id } as any,
        match_score: score,
        matched_criteria: matchedCriteria,
        unmatched_criteria: unmatchedCriteria,
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
