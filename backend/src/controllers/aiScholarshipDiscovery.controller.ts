import { Request, Response } from "express";
import { AIScholarshipDiscoveryService } from "../services/aiScholarshipDiscovery.service";

export class AIScholarshipDiscoveryController {
  private discoveryService: AIScholarshipDiscoveryService;

  constructor() {
    this.discoveryService = new AIScholarshipDiscoveryService();
  }

  /**
   * POST /api/student/discover-scholarships
   * Natural language scholarship discovery
   */
  discoverScholarships = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.body;
      const studentId = req.user?.id;

      if (!studentId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      if (!query || typeof query !== "string" || query.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Query is required",
        });
        return;
      }

      const result = await this.discoveryService.discoverScholarships(
        query,
        studentId
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("AI Discovery error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to discover scholarships",
        error: error.message,
      });
    }
  };
}
