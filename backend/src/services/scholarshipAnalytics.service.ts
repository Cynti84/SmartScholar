import {
  ScholarshipRepository,
  ApplicationRepository,
} from "../repositories/scholarship.repository";
import { Application } from "../models/applications";
import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";

const applicationRepo = AppDataSource.getRepository(Application);
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
      .select("scholarship.scholarship_id::int", "scholarship_id")
      .addSelect("scholarship.title", "title")
      .addSelect("COUNT(application.application_id)::int", "application_count")
      .groupBy("scholarship.scholarship_id")
      .addGroupBy("scholarship.title")
      .orderBy("application_count", "DESC")
      .limit(1)
      .getRawOne();

    if (!result || result.scholarship_id == null) {
      return {
        success: true,
        message: "No applications yet",
        popular_scholarship: null,
      };
    }
    // ✅ Strong validation
    const scholarshipId = Number(result.scholarship_id);
    const applicationCount = Number(result.application_count) || 0;

    return {
      success: true,
      popular_scholarship: {
        scholarship_id: scholarshipId,
        title: result.title,
        application_count: Number.isNaN(applicationCount)
          ? 0
          : applicationCount,
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
      .sort(
        (a, b) =>
          new Date(a.deadline as any).getTime() -
          new Date(b.deadline as any).getTime()
      )
      .slice(0, 5);

    return {
      totalScholarships,
      totalApplications,
      mostPopularScholarship: mostPopular,
      upcomingDeadlines,
    };
  }

  async getApplicantsByEducationLevel(
    providerId: number,
    scholarshipId?: number
  ) {
    const qb = applicationRepo
      .createQueryBuilder("a")
      .innerJoin("a.scholarship", "s")
      .innerJoin("a.student", "u")
      .innerJoin("u.profile", "p")
      .where("s.provider_id=:providerId", { providerId })
      .andWhere("a.applied=true");

    if (scholarshipId) {
      qb.andWhere("s.scholarship_id=:scholarshipId", { scholarshipId });
    }

    return qb
      .select("p.academic_level", "education_level")
      .addSelect("COUNT(*)", "count")
      .groupBy("p.academic_level")
      .getRawMany();
  }

  async getApplicantsByField(providerId: number, scholarshipId?: number) {
    const qb = applicationRepo
      .createQueryBuilder("a")
      .innerJoin("a.scholarship", "s")
      .innerJoin("a.student", "u")
      .innerJoin("u.profile", "p")
      .where("s.provider_id = :providerId", { providerId })
      .andWhere("a.applied = true");

    if (scholarshipId) {
      qb.andWhere("s.scholarship_id = :scholarshipId", { scholarshipId });
    }

    return qb
      .select("p.field_of_study", "field")
      .addSelect("COUNT(*)", "count")
      .groupBy("p.field_of_study")
      .getRawMany();
  }

  async getApplicantsByCountry(providerId: number, scholarshipId?: number) {
    const qb = applicationRepo
      .createQueryBuilder("a")
      .innerJoin("a.scholarship", "s")
      .innerJoin("a.student", "u")
      .innerJoin("u.profile", "p")
      .where("s.provider_id = :providerId", { providerId })
      .andWhere("a.applied = true");

    if (scholarshipId) {
      qb.andWhere("s.scholarship_id = :scholarshipId", { scholarshipId });
    }

    return qb
      .select("p.country", "country")
      .addSelect("COUNT(*)", "count")
      .groupBy("p.country")
      .getRawMany();
  }

  async getScholarshipOverview(providerId: number) {
    const rows = await applicationRepo
      .createQueryBuilder("a")
      .innerJoin("a.scholarship", "s")
      .innerJoin("a.student", "u")
      .innerJoin("u.profile", "p")
      .where("s.provider_id = :providerId", { providerId })
      .andWhere("a.applied = true")
      .select("s.scholarship_id", "scholarship_id")
      .addSelect("s.title", "title")
      .addSelect("p.field_of_study", "field")
      .addSelect("p.country", "country")
      .getRawMany();

    type Accumulator = {
      title: string;
      total_applications: number;
      fieldCounts: Record<string, number>;
      countryCounts: Record<string, number>;
    };

    const map = new Map<number, Accumulator>();

    for (const r of rows) {
      if (!map.has(r.scholarship_id)) {
        map.set(r.scholarship_id, {
          title: r.title,
          total_applications: 0,
          fieldCounts: {},
          countryCounts: {},
        });
      }

      const acc = map.get(r.scholarship_id)!;

      acc.total_applications += 1;

      acc.fieldCounts[r.field] = (acc.fieldCounts[r.field] || 0) + 1;
      acc.countryCounts[r.country] = (acc.countryCounts[r.country] || 0) + 1;
    }

    return Array.from(map.values()).map((s) => {
      const topField =
        (Object.entries(s.fieldCounts) as [string, number][]).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0] ?? "-";

      const topCountry =
        (Object.entries(s.countryCounts) as [string, number][]).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0] ?? "-";

      return {
        title: s.title,
        total_applications: s.total_applications,
        top_field: topField,
        top_country: topCountry,
      };
    });
  }

  async getTotalApplicationsCount(providerId: number) {
    const result = await applicationRepo
      .createQueryBuilder("a")
      .innerJoin("a.scholarship", "s")
      .where("s.provider_id = :providerId", { providerId })
      .andWhere("a.applied = true")
      .select("COUNT(a.application_id)", "count")
      .getRawOne();

    return {
      count: Number(result?.count ?? 0),
    };
  }

  async getSoonestScholarshipDeadline(providerId: number) {
    const result = await AppDataSource.getRepository(Scholarship)
      .createQueryBuilder("s")
      .where("s.provider_id = :providerId", { providerId })
      .andWhere("s.status IN ('approved', 'published')")
      .andWhere("s.deadline >= CURRENT_DATE")
      .orderBy("s.deadline", "ASC")
      .select(["s.title", "s.deadline"])
      .limit(1)
      .getOne();

    if (!result) {
      return {
        title: null,
        deadline: null,
      };
    }

    return {
      title: result.title,
      deadline: result.deadline,
    };
  }
}

export const scholarshipAnalyticsService = new ScholarshipAnalyticsService();
