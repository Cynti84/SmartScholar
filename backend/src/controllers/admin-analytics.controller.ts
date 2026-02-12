import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { Application } from "../models/applications";
import { Scholarship } from "../models/scholarships";
import { User, UserRole } from "../models/users";

export class AdminAnalyticsController {
  static async getDashboardAnalytics(req: Request, res: Response) {
    try {
      const applicationRepo = AppDataSource.getRepository(Application);
      const scholarshipRepo = AppDataSource.getRepository(Scholarship);
      const userRepo = AppDataSource.getRepository(User);

      /* ===============================
         1. Most Applied Scholarships
      ================================ */
      const mostApplied = await applicationRepo
        .createQueryBuilder("app")
        .leftJoin("app.scholarship", "scholarship")
        .select("scholarship.title", "label")
        .addSelect("COUNT(app.application_id)", "value")
        .groupBy("scholarship.title")
        .orderBy("value", "DESC")
        .limit(5)
        .getRawMany();

      /* ===============================
         2. Monthly Signups
      ================================ */
      const monthlySignups = await userRepo
        .createQueryBuilder("user")
        .select("TO_CHAR(user.createdAt, 'Mon YYYY')", "label")
        .addSelect("COUNT(user.id)", "value")
        .where("user.role != :admin", { admin: UserRole.ADMIN })
        .groupBy("label")
        .orderBy("MIN(user.createdAt)", "ASC")
        .getRawMany();

      /* ===============================
         3. Category Distribution
      ================================ */
      const categoryDistribution = await scholarshipRepo
        .createQueryBuilder("scholarship")
        .select("scholarship.scholarship_type", "label")
        .addSelect("COUNT(scholarship.scholarship_id)", "value")
        .groupBy("scholarship.scholarship_type")
        .getRawMany();

      /* ===============================
         4. Provider Activity
      ================================ */
      const providerActivity = await scholarshipRepo
        .createQueryBuilder("scholarship")
        .leftJoin("scholarship.provider", "provider")
        .select("provider.email", "label")
        .addSelect("COUNT(scholarship.scholarship_id)", "value")
        .where("provider.role = :role", { role: UserRole.PROVIDER })
        .groupBy("provider.email")
        .orderBy("value", "DESC")
        .limit(5)
        .getRawMany();

      return res.json({
        success: true,
        data: {
          mostAppliedScholarships: mostApplied,
          monthlySignups,
          categoryDistribution,
          providerActivity,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to load admin analytics",
      });
    }
  }
}
