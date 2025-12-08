import {
  ScholarshipRepository,
  ApplicationRepository,
} from "../repositories/scholarship.repository";

export class ScholarshipAnalyticsService {
  /**
   * Get all applications for a provider's scholarship
   */
  async getApplications(providerId: number, scholarshipId: number) {
    const scholarship = await ScholarshipRepository.findOne({
      where: { scholarship_id: scholarshipId, provider_id: providerId },
    });

    if (!scholarship) throw new Error("Scholarship not found or unauthorized");

    return await ApplicationRepository.find({
      where: { scholarship: { scholarship_id: scholarshipId } },
      relations: ["student"],
    });
  }

  /**
   * Get count of applications for a scholarship
   */
  async getApplicationCount(providerId: number, scholarshipId: number) {
    const total = await ApplicationRepository.count({
      where: {
        scholarship: { scholarship_id: scholarshipId, provider_id: providerId },
      },
    });

    return { scholarshipId, totalApplications: total };
  }

  /**
   * Get scholarship with most applications for this provider
   */
  async getMostPopularScholarship(providerId: number) {
    const result = await ApplicationRepository.createQueryBuilder("application")
      .leftJoin("application.scholarship", "scholarship")
      .where("scholarship.provider_id = :providerId", { providerId })
      .select("scholarship.scholarship_id", "scholarship_id")
      .addSelect("scholarship.title", "title")
      .addSelect("COUNT(application.application_id)", "application_count")
      .groupBy("scholarship.scholarship_id")
      .orderBy("application_count", "DESC")
      .limit(1)
      .getRawOne();

    // 🔥 If no applications, avoid sending undefined
    if (!result || !result.scholarship_id) {
      return {
        success: true,
        message: "No applications yet",
        popular_scholarship: null,
      };
    }

    // 🔥 Convert IDs safely (avoids NaN)
    return {
      success: true,
      popular_scholarship: {
        scholarship_id: parseInt(result.scholarship_id, 10),
        title: result.title,
        application_count: parseInt(result.application_count, 10),
      },
    };
  }

  /**
   * Get scholarship deadline
   */
  async getScholarshipDeadline(providerId: number, scholarshipId: number) {
    const scholarship = await ScholarshipRepository.findOne({
      where: { scholarship_id: scholarshipId, provider_id: providerId },
      select: ["scholarship_id", "title", "deadline"],
    });

    if (!scholarship) throw new Error("Scholarship not found or unauthorized");

    return scholarship;
  }

  /**
   * Provider Dashboard Summary
   */
  async getDashboardSummary(providerId: number) {
    const scholarships = await ScholarshipRepository.find({
      where: { provider_id: providerId },
    });

    const totalScholarships = scholarships.length;

    const totalApplications = await ApplicationRepository.createQueryBuilder(
      "app"
    )
      .leftJoin("app.scholarship", "sch")
      .where("sch.provider_id = :providerId", { providerId })
      .getCount();

    const mostPopular = await this.getMostPopularScholarship(providerId);

    const upcomingDeadlines = scholarships
      .filter((s) => s.deadline && new Date(s.deadline) > new Date())
      .sort((a, b) => a.deadline!.getTime() - b.deadline!.getTime())
      .slice(0, 5);

    return {
      totalScholarships,
      totalApplications,
      mostPopularScholarship: mostPopular,
      upcomingDeadlines,
    };
  }
}

export const scholarshipAnalyticsService = new ScholarshipAnalyticsService();
