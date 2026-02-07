import { Request, Response } from "express";
import { ApplicationReadinessService } from "../services/applicationReadiness.service";
import { AppDataSource } from "../utils/db";
import { StudentProfile } from "../models/student_profiles";
import { Scholarship } from "../models/scholarships";

export class ApplicationReadinessController {
  private readinessService: ApplicationReadinessService;
  private studentProfileRepo = AppDataSource.getRepository(StudentProfile);
  private scholarshipRepo = AppDataSource.getRepository(Scholarship);

  constructor() {
    this.readinessService = new ApplicationReadinessService();
  }

  /**
   * POST /api/student/scholarships/:scholarshipId/check-readiness
   * Checks if a student is ready to apply for a specific scholarship
   */
  checkReadiness = async (req: Request, res: Response): Promise<void> => {
    try {
      const { scholarshipId } = req.params;
      const studentId = req.user?.id; // From auth middleware

      if (!studentId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // Fetch student profile
      const studentProfile = await this.studentProfileRepo.findOne({
        where: { student_id: studentId },
      });

      if (!studentProfile) {
        res.status(404).json({
          success: false,
          message:
            "Student profile not found. Please complete your profile first.",
        });
        return;
      }

      // Fetch scholarship
      const scholarship = await this.scholarshipRepo.findOne({
        where: { scholarship_id: parseInt(scholarshipId) },
      });

      if (!scholarship) {
        res.status(404).json({
          success: false,
          message: "Scholarship not found",
        });
        return;
      }

      // Check if scholarship is published/approved
      if (
        scholarship.status !== "published" &&
        scholarship.status !== "approved"
      ) {
        res.status(400).json({
          success: false,
          message: "This scholarship is not currently available",
        });
        return;
      }

      // Perform readiness check
      const readinessResult =
        await this.readinessService.checkApplicationReadiness(
          studentProfile,
          scholarship
        );

      res.status(200).json({
        success: true,
        data: {
          scholarship: {
            id: scholarship.scholarship_id,
            title: scholarship.title,
            organization: scholarship.organization_name,
            deadline: scholarship.deadline,
          },
          readiness: readinessResult,
        },
      });
    } catch (error: any) {
      console.error("Application readiness check error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check application readiness",
        error: error.message,
      });
    }
  };
}
