import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";
import { StudentProfile } from "../models/student_profiles";
import { User } from "../models/users";

export class AdminController {
  /** Get all scholarships */
  static async getAllScholarships(req: Request, res: Response): Promise<void> {
    try {
      const scholarshipRepo = AppDataSource.getRepository(Scholarship);
      const scholarships = await scholarshipRepo.find({
        relations: ["provider"],
        order: { scholarship_id: "DESC" },
      });

      res.json({
        success: true,
        data: scholarships,
        count: scholarships.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to fetch scholarships" });
      }
    }
  }

  /** Get total number of students */
  static async getTotalStudents(req: Request, res: Response): Promise<void> {
    try {
      const studentRepo = AppDataSource.getRepository(User);
      const total = await studentRepo.count();

      res.json({
        success: true,
        data: { total },
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to get total students" });
      }
    }
  }
}
