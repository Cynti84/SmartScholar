import { Request, Response } from "express";
import { ApplicationAssistantService } from "../services/applicationAssistant.service";
const assistantService = new ApplicationAssistantService();

export class ApplicationAssistantController {
  /**
   * GET /api/student/application-assistant/checklist/:scholarshipId
   * Generate document checklist
   */
  async getDocumentChecklist(req: Request, res: Response) {
    try {
      const scholarshipId = parseInt(req.params.scholarshipId);
      const studentId = (req as any).user.userId; // From auth middleware

      if (!scholarshipId || isNaN(scholarshipId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid scholarship ID",
        });
      }

      const checklist = await assistantService.generateDocumentChecklist(
        scholarshipId,
        studentId
      );

      res.json({
        success: true,
        data: checklist,
      });
    } catch (error: any) {
      console.error("Error generating checklist:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate checklist",
      });
    }
  }

  /**
   * GET /api/student/application-assistant/interview-questions/:scholarshipId
   * Generate interview questions
   */
  async getInterviewQuestions(req: Request, res: Response) {
    try {
      const scholarshipId = parseInt(req.params.scholarshipId);
      const studentId = (req as any).user.userId;

      if (!scholarshipId || isNaN(scholarshipId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid scholarship ID",
        });
      }

      const questions = await assistantService.generateInterviewQuestions(
        scholarshipId,
        studentId
      );

      res.json({
        success: true,
        data: questions,
      });
    } catch (error: any) {
      console.error("Error generating questions:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate interview questions",
      });
    }
  }

  /**
   * GET /api/student/application-assistant/tips/:scholarshipId
   * Generate application tips
   */
  async getApplicationTips(req: Request, res: Response) {
    try {
      const scholarshipId = parseInt(req.params.scholarshipId);
      const studentId = (req as any).user.userId;

      if (!scholarshipId || isNaN(scholarshipId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid scholarship ID",
        });
      }

      const tips = await assistantService.generateApplicationTips(
        scholarshipId,
        studentId
      );

      res.json({
        success: true,
        data: tips,
      });
    } catch (error: any) {
      console.error("Error generating tips:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to generate application tips",
      });
    }
  }

  /**
   * POST /api/student/application-assistant/review-essay/:scholarshipId
   * Review student's essay
   */
  async reviewEssay(req: Request, res: Response) {
    try {
      const scholarshipId = parseInt(req.params.scholarshipId);
      const studentId = (req as any).user.userId;
      const { essay } = req.body;

      if (!scholarshipId || isNaN(scholarshipId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid scholarship ID",
        });
      }

      if (!essay || typeof essay !== "string") {
        return res.status(400).json({
          success: false,
          message: "Essay text is required",
        });
      }

      const review = await assistantService.reviewEssay(
        scholarshipId,
        studentId,
        essay
      );

      res.json({
        success: true,
        data: review,
      });
    } catch (error: any) {
      console.error("Error reviewing essay:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to review essay",
      });
    }
  }
}
