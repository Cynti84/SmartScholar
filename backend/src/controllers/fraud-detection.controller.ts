import { Request, Response } from "express";
import { FraudDetectionService } from "../services/fraud-detection.service";

const fraudService = new FraudDetectionService();

export class FraudDetectionController {
  /**
   * Analyze single scholarship
   */
  async analyzeScholarship(req: Request, res: Response) {
    try {
      const scholarshipId = parseInt(req.params.scholarshipId);

      if (!scholarshipId || isNaN(scholarshipId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid scholarship ID",
        });
      }

      const analysis = await fraudService.analyzeScholarship(scholarshipId);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      console.error("Fraud analysis error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to analyze scholarship",
      });
    }
  }

  /**
   * Analyze multiple scholarships
   */
  async batchAnalyze(req: Request, res: Response) {
    try {
      const { scholarshipIds } = req.body;

      if (!Array.isArray(scholarshipIds) || scholarshipIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid scholarship IDs array",
        });
      }

      const result = await fraudService.batchAnalyze(scholarshipIds);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("Batch analysis error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to batch analyze",
      });
    }
  }

  /**
   * Get all high-risk pending scholarships
   */
  async getHighRiskScholarships(req: Request, res: Response) {
    try {
      const scholarshipIds = await fraudService.getHighRiskScholarships();

      res.json({
        success: true,
        data: {
          count: scholarshipIds.length,
          scholarshipIds,
        },
      });
    } catch (error: any) {
      console.error("High risk fetch error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch high-risk scholarships",
      });
    }
  }
}
