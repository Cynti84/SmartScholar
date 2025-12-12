import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";
import { StudentProfile } from "../models/student_profiles";
import { User, UserRole, UserStatus } from "../models/users";
import { ProviderProfile } from "../models/provider_profiles";

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

  // Getting PendingScholarship
  static async getPendingScholarships(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const scholarshipRepo = AppDataSource.getRepository(Scholarship);

      const pendingScholarships = await scholarshipRepo.find({
        where: { status: "pending" },
        relations: ["provider"],
      });

      res.json({
        success: true,
        count: pendingScholarships.length,
        data: pendingScholarships,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending scholarships",
        error: error.message,
      });
    }
  }

  // STUDENTS
  /** Get total number of students   tested */
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

  // GET /api/admin/students - Get all students
  static async getAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const studentRepo = AppDataSource.getRepository(User);

      const students = await studentRepo.find({
        relations: ["applications"],
        order: { createdAt: "DESC" },
      });

      res.json({
        success: true,
        data: students,
        count: students.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch students",
        error: error.message,
      });
    }
  }

  //PROVIDERS
  //Getting providers
  static async getProviders(req: Request, res: Response): Promise<void> {
    try {
      const providerRepo = AppDataSource.getRepository(ProviderProfile);

      const providers = await providerRepo.find({
        // relations: ["provider_id"],
        order: { created_at: "DESC" },
      });

      res.json({
        success: true,
        data: providers,
        count: providers.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch providers",
        error: error.message,
      });
    }
  }

  //Get pending Providers
  static async getPendingProviders(req: Request, res: Response): Promise<void> {
    try {
      const userRepo = AppDataSource.getRepository(User);

      const pendingProviders = await userRepo.find({
        where: {
          status: UserStatus.PENDING,
          role: UserRole.PROVIDER,
        },
        order: { createdAt: "DESC" },
      });
      res.json({
        success: true,
        count: pendingProviders.length,
        data: pendingProviders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending providers",
        error: error.message,
      });
    }
  }
}
