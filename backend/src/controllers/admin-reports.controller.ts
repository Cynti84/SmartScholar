// src/controllers/admin-reports.controller.ts
import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { User, UserRole } from "../models/users";
import { Scholarship } from "../models/scholarships";
import { Application } from "../models/applications";

export class AdminReportsController {
  static async getDashboardData(req: Request, res: Response) {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const scholarshipRepo = AppDataSource.getRepository(Scholarship);

      // 1️⃣ Students growth by month
      const monthlySignups = await userRepo
        .createQueryBuilder("user")
        .select("TO_CHAR(user.createdAt, 'Mon YYYY')", "month")
        .addSelect("COUNT(user.id)", "count")
        .where("user.role = :role", { role: UserRole.STUDENT })
        .groupBy("month")
        .orderBy("MIN(user.createdAt)", "ASC")
        .getRawMany();

      // 2️⃣ Scholarships by status
      const scholarshipsByStatus = await scholarshipRepo
        .createQueryBuilder("sch")
        .select("sch.status", "status")
        .addSelect("COUNT(sch.scholarship_id)", "count")
        .groupBy("sch.status")
        .getRawMany();

      // 3️⃣ Scholarships by country
      const scholarshipsByCountry = await scholarshipRepo
        .createQueryBuilder("sch")
        .select("sch.country", "country")
        .addSelect("COUNT(sch.scholarship_id)", "count")
        .groupBy("sch.country")
        .getRawMany();

      // 4️⃣ Top fields of study
      const fieldsData = await scholarshipRepo
        .createQueryBuilder("sch")
        .select("jsonb_array_elements_text(sch.fields_of_study)", "field")
        .addSelect("COUNT(*)", "count")
        .groupBy("field")
        .getRawMany();

      // 5️⃣ Top providers (number of scholarships)
      const topProviders = await userRepo
        .createQueryBuilder("user")
        .leftJoin(Scholarship, "sch", "sch.provider_id = user.id")
        .select("user.firstName || ' ' || user.lastName", "provider")
        .addSelect("COUNT(sch.scholarship_id)", "count")
        .where("user.role = :role", { role: UserRole.PROVIDER })
        .groupBy("user.id")
        .orderBy("count", "DESC")
        .limit(5)
        .getRawMany();

      // ✅ Respond with normalized keys for Angular frontend
      return res.json({
        success: true,
        data: {
          monthlySignups: monthlySignups || [],
          scholarshipsByStatus: scholarshipsByStatus || [],
          scholarshipsByCountry: scholarshipsByCountry || [],
          fieldsData: fieldsData || [],
          topProviders: topProviders || [],
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard data",
      });
    }
  }
}
