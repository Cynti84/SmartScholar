import { GoogleGenerativeAI } from "@google/generative-ai";
import { StudentProfile } from "../models/student_profiles";
import { Scholarship } from "../models/scholarships";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ReadinessResult {
  overallReadiness:
    | "ready"
    | "mostly-ready"
    | "needs-improvement"
    | "not-eligible";
  readinessScore: number; // 0-100
  matchedCriteria: string[];
  unmatchedCriteria: string[];
  weakAreas: string[];
  strengthAreas: string[];
  recommendations: string[];
  aiExplanation: string;
}

export class ApplicationReadinessService {
  private model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  /**
   * Analyzes how ready a student is to apply for a specific scholarship
   */
  async checkApplicationReadiness(
    student: StudentProfile,
    scholarship: Scholarship
  ): Promise<ReadinessResult> {
    // Step 1: Rule-based matching
    const matchAnalysis = this.analyzeMatch(student, scholarship);

    // Step 2: Get AI-powered insights and recommendations
    const aiInsights = await this.generateAIReadinessReport(
      student,
      scholarship,
      matchAnalysis
    );

    // Step 3: Combine results
    return {
      ...matchAnalysis,
      aiExplanation: aiInsights,
    };
  }

  /**
   * Rule-based matching logic aligned with your database schema
   */
  private analyzeMatch(
    student: StudentProfile,
    scholarship: Scholarship
  ): Omit<ReadinessResult, "aiExplanation"> {
    const matched: string[] = [];
    const unmatched: string[] = [];
    const weakAreas: string[] = [];
    const strengthAreas: string[] = [];
    const recommendations: string[] = [];

    // ===== COUNTRY CHECK =====
    if (
      scholarship.eligibility_countries &&
      scholarship.eligibility_countries.length > 0
    ) {
      const isCountryMatch =
        scholarship.eligibility_countries.includes("Any") ||
        scholarship.eligibility_countries.some(
          (c) => c.toLowerCase() === student.country.toLowerCase()
        );

      if (isCountryMatch) {
        matched.push(`Your country (${student.country}) is eligible`);
        strengthAreas.push("Geographic eligibility");
      } else {
        unmatched.push(
          `Country requirement not met. Required: ${scholarship.eligibility_countries.join(
            ", "
          )}, Yours: ${student.country}`
        );
        // This is a hard blocker - return immediately
        return {
          overallReadiness: "not-eligible",
          readinessScore: 0,
          matchedCriteria: matched,
          unmatchedCriteria: unmatched,
          weakAreas: ["Geographic ineligibility"],
          strengthAreas: [],
          recommendations: [
            "Unfortunately, this scholarship is not available for students from your country.",
          ],
        };
      }
    }

    // ===== ACADEMIC LEVEL CHECK =====
    if (scholarship.education_level) {
      // Normalize for comparison (handles "Masters" vs "Master's", etc.)
      const normalizeLevel = (level: string) =>
        level.toLowerCase().replace(/[''s]/g, "").trim();

      const isLevelMatch =
        normalizeLevel(scholarship.education_level) ===
        normalizeLevel(student.academic_level);

      if (isLevelMatch) {
        matched.push(`Your academic level (${student.academic_level}) matches`);
        strengthAreas.push("Academic level");
      } else {
        unmatched.push(
          `Academic level mismatch. Required: ${scholarship.education_level}, Yours: ${student.academic_level}`
        );
        weakAreas.push("Academic level");
      }
    }

    // ===== FIELD OF STUDY CHECK =====
    if (scholarship.fields_of_study && scholarship.fields_of_study.length > 0) {
      const fieldMatch = scholarship.fields_of_study.some(
        (field) =>
          field.toLowerCase().includes(student.field_of_study.toLowerCase()) ||
          student.field_of_study.toLowerCase().includes(field.toLowerCase())
      );

      if (fieldMatch) {
        matched.push(
          `Your field of study (${student.field_of_study}) is relevant`
        );
        strengthAreas.push("Field of study");
      } else {
        unmatched.push(
          `Field of study may not match. Preferred: ${scholarship.fields_of_study.join(
            ", "
          )}, Yours: ${student.field_of_study}`
        );
        weakAreas.push("Field of study");
      }
    }

    // ===== GPA CHECK =====
    if (scholarship.min_gpa) {
      if (student.gpa_min && student.gpa_max) {
        // Student has GPA range
        if (student.gpa_max >= scholarship.min_gpa) {
          matched.push(
            `Your GPA range (${student.gpa_min}-${student.gpa_max}) meets or exceeds the minimum requirement (${scholarship.min_gpa})`
          );
          strengthAreas.push("Academic performance");
        } else {
          unmatched.push(
            `GPA below requirement. Required: ${scholarship.min_gpa}, Your range: ${student.gpa_min}-${student.gpa_max}`
          );
          weakAreas.push("GPA");
          recommendations.push(
            `Work on improving your GPA. Required: ${scholarship.min_gpa}, Your current range: ${student.gpa_min}-${student.gpa_max}`
          );
        }
      } else {
        unmatched.push("GPA information missing from your profile");
        weakAreas.push("Missing GPA");
        recommendations.push(
          "Add your GPA range to your profile for accurate assessment"
        );
      }
    }

    // ===== AGE CHECK =====
    const studentAge = student.age;
    if (scholarship.min_age || scholarship.max_age) {
      if (studentAge) {
        const meetsMinAge =
          !scholarship.min_age || studentAge >= scholarship.min_age;
        const meetsMaxAge =
          !scholarship.max_age || studentAge <= scholarship.max_age;

        if (meetsMinAge && meetsMaxAge) {
          matched.push(
            `Your age (${studentAge}) is within the eligible range ${
              scholarship.min_age || "N/A"
            }-${scholarship.max_age || "N/A"}`
          );
          strengthAreas.push("Age eligibility");
        } else {
          unmatched.push(
            `Age requirement not met. Required: ${
              scholarship.min_age || "N/A"
            }-${scholarship.max_age || "N/A"}, Yours: ${studentAge}`
          );
          weakAreas.push("Age eligibility");
        }
      } else {
        unmatched.push("Date of birth missing from your profile");
        recommendations.push(
          "Add your date of birth to your profile for better matching"
        );
      }
    }

    // ===== GENDER CHECK =====
    if (
      scholarship.eligibility_gender &&
      scholarship.eligibility_gender !== "any"
    ) {
      if (student.gender) {
        if (student.gender === scholarship.eligibility_gender) {
          matched.push("Gender requirement matches your profile");
        } else {
          unmatched.push(
            `This scholarship is for ${scholarship.eligibility_gender} students only`
          );
          weakAreas.push("Gender eligibility");
        }
      } else {
        recommendations.push("Add gender to your profile for better matching");
      }
    }

    // ===== DISABILITY REQUIREMENT CHECK =====
    if (scholarship.requires_disability === true) {
      if (student.is_disabled === true) {
        matched.push("Disability requirement matches your profile");
        strengthAreas.push("Disability eligibility");
      } else {
        unmatched.push(
          "This scholarship is specifically for students with disabilities"
        );
        weakAreas.push("Disability requirement");
      }
    }

    // ===== INCOME LEVEL CHECK =====
    if (scholarship.income_level && scholarship.income_level !== "any") {
      if (student.income_level) {
        if (
          student.income_level === scholarship.income_level ||
          student.income_level === "any"
        ) {
          matched.push("Income level requirement matches");
        } else {
          unmatched.push(
            `Income level mismatch. Required: ${scholarship.income_level}, Yours: ${student.income_level}`
          );
          weakAreas.push("Income level");
        }
      } else {
        recommendations.push(
          "Add income level to your profile for better matching"
        );
      }
    }

    // ===== DEADLINE CHECK =====
    const deadline = new Date(scholarship.deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDeadline < 0) {
      unmatched.push("⚠️ This scholarship deadline has passed");
      weakAreas.push("Deadline expired");
    } else if (daysUntilDeadline <= 7) {
      recommendations.push(
        `⏰ Urgent: Only ${daysUntilDeadline} day(s) left until the deadline! Apply immediately if interested.`
      );
    } else if (daysUntilDeadline <= 30) {
      recommendations.push(
        `⏰ ${daysUntilDeadline} days until deadline. Start preparing your application soon.`
      );
    } else {
      matched.push(`You have ${daysUntilDeadline} days until the deadline`);
    }

    // ===== PROFILE COMPLETENESS CHECKS =====
    if (!student.cv_url) {
      recommendations.push(
        "📄 Upload your CV/Resume to strengthen your profile"
      );
      weakAreas.push("Missing CV");
    }

    if (!student.profile_image_url) {
      recommendations.push("🖼️ Add a profile picture for a complete profile");
    }

    if (!student.interest || student.interest.trim().length === 0) {
      recommendations.push(
        "✍️ Add your interests to help match with relevant scholarships"
      );
    }

    // ===== CALCULATE READINESS SCORE =====
    // Core eligibility criteria (must-haves)
    const coreChecks = [
      scholarship.eligibility_countries?.length ? 1 : 0,
      scholarship.eligible_education_levels?.length ? 1 : 0,
      scholarship.fields_of_study?.length ? 1 : 0,
      scholarship.min_gpa ? 1 : 0,
    ].filter(Boolean).length;

    // Additional criteria (nice-to-haves)
    const additionalChecks = [
      scholarship.min_age || scholarship.max_age ? 1 : 0,
      scholarship.eligibility_gender && scholarship.eligibility_gender !== "any"
        ? 1
        : 0,
      scholarship.requires_disability === true ? 1 : 0,
      scholarship.income_level && scholarship.income_level !== "any" ? 1 : 0,
    ].filter(Boolean).length;

    const totalChecks = coreChecks + additionalChecks;
    const passedChecks = matched.length;

    // Weight core criteria more heavily (70%) vs additional criteria (30%)
    const coreMatchedCount = matched.filter(
      (m) =>
        m.includes("country") ||
        m.includes("academic level") ||
        m.includes("field of study") ||
        m.includes("GPA")
    ).length;

    const coreScore =
      coreChecks > 0 ? (coreMatchedCount / coreChecks) * 70 : 70;
    const additionalScore =
      additionalChecks > 0
        ? ((passedChecks - coreMatchedCount) / additionalChecks) * 30
        : 30;

    const readinessScore = Math.round(
      Math.min(coreScore + additionalScore, 100)
    );

    // ===== DETERMINE OVERALL READINESS =====
    let overallReadiness: ReadinessResult["overallReadiness"];

    // Hard blockers
    if (
      weakAreas.includes("Geographic ineligibility") ||
      weakAreas.includes("Deadline expired")
    ) {
      overallReadiness = "not-eligible";
    } else if (readinessScore >= 85) {
      overallReadiness = "ready";
    } else if (readinessScore >= 65) {
      overallReadiness = "mostly-ready";
    } else if (readinessScore >= 40) {
      overallReadiness = "needs-improvement";
    } else {
      overallReadiness = "not-eligible";
    }

    return {
      overallReadiness,
      readinessScore,
      matchedCriteria: matched,
      unmatchedCriteria: unmatched,
      weakAreas,
      strengthAreas,
      recommendations,
    };
  }

  /**
   * Generate AI-powered readiness explanation
   */
  private async generateAIReadinessReport(
    student: StudentProfile,
    scholarship: Scholarship,
    matchAnalysis: Omit<ReadinessResult, "aiExplanation">
  ): Promise<string> {
    const studentAge = student.age;

    const prompt = `
You are a friendly scholarship application advisor helping a student understand their readiness to apply for a scholarship.

Student Profile:
- Country: ${student.country}
- Academic Level: ${student.academic_level}
- Field of Study: ${student.field_of_study}
- GPA Range: ${
      student.gpa_min && student.gpa_max
        ? `${student.gpa_min}-${student.gpa_max}`
        : "Not provided"
    }
- Age: ${studentAge || "Not provided"}
- Gender: ${student.gender || "Not provided"}
- Has Disability: ${student.is_disabled ? "Yes" : "No"}
- Income Level: ${student.income_level || "Not specified"}
- Has CV: ${student.cv_url ? "Yes" : "No"}
- Interests: ${student.interest || "Not provided"}

Scholarship: ${scholarship.title}
Organization: ${scholarship.organization_name}
Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}
Type: ${scholarship.scholarship_type}

Match Analysis:
- Readiness Score: ${matchAnalysis.readinessScore}%
- Overall Status: ${matchAnalysis.overallReadiness}
- Matched Criteria: ${
      matchAnalysis.matchedCriteria.length > 0
        ? matchAnalysis.matchedCriteria.join("; ")
        : "None"
    }
- Unmatched Criteria: ${
      matchAnalysis.unmatchedCriteria.length > 0
        ? matchAnalysis.unmatchedCriteria.join("; ")
        : "None"
    }
- Weak Areas: ${
      matchAnalysis.weakAreas.length > 0
        ? matchAnalysis.weakAreas.join("; ")
        : "None"
    }
- Strength Areas: ${
      matchAnalysis.strengthAreas.length > 0
        ? matchAnalysis.strengthAreas.join("; ")
        : "None"
    }

Task:
Provide a friendly, personalized readiness assessment in 3-4 short paragraphs:

1. Start with an overall assessment using emojis (e.g., "🎉 You're ready to go!" or "💪 You need to work on a few things")
2. Highlight their strengths (what matches well) - be specific
3. Address weak areas and unmatched criteria with specific, actionable advice
4. Give timeline recommendations based on the deadline

Rules:
- Be encouraging but honest
- Use "you" and "your" (personal tone)
- Be specific and actionable
- Don't make promises about acceptance
- Keep it concise (max 4 short paragraphs, about 2-3 sentences each)
- Don't use bullet points, write in prose
- Use emojis sparingly (1-2 per paragraph max)
- If they're not eligible, be kind but clear about why
`;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("AI readiness report generation error:", error);
      return this.generateFallbackMessage(matchAnalysis);
    }
  }

  /**
   * Fallback message if AI fails
   */
  private generateFallbackMessage(
    matchAnalysis: Omit<ReadinessResult, "aiExplanation">
  ): string {
    if (matchAnalysis.overallReadiness === "ready") {
      return `🎉 Great news! You meet all the major requirements for this scholarship. Your profile strongly aligns with what they're looking for. ${
        matchAnalysis.recommendations.length > 0
          ? "To further strengthen your application, consider: " +
            matchAnalysis.recommendations.join(", ") +
            "."
          : "You're ready to apply!"
      }`;
    } else if (matchAnalysis.overallReadiness === "mostly-ready") {
      return `💪 You're on the right track! You meet most of the requirements. However, there are a few areas to improve: ${matchAnalysis.weakAreas.join(
        ", "
      )}. ${
        matchAnalysis.recommendations.length > 0
          ? matchAnalysis.recommendations.join(". ")
          : ""
      }`;
    } else if (matchAnalysis.overallReadiness === "needs-improvement") {
      return `📝 You have some work to do before applying. Key areas to focus on: ${matchAnalysis.weakAreas.join(
        ", "
      )}. ${
        matchAnalysis.recommendations.length > 0
          ? "Here's what you should do: " +
            matchAnalysis.recommendations.join(". ")
          : ""
      }`;
    } else {
      return `❌ Unfortunately, you don't meet the core eligibility requirements for this scholarship. ${
        matchAnalysis.unmatchedCriteria[0] ||
        "Please review the requirements carefully."
      }`;
    }
  }
}
