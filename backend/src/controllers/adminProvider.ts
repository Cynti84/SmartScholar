import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { User, UserRole } from "../models/users";
import { Scholarship } from "../models/scholarships";

export class AdminProviderController {
  // GET /admin/providers/:id/scholarships
  static async getProviderScholarships(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const providerId = Number(req.params.id);
      if (!Number.isInteger(providerId)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid provider ID" });
        return;
      }

      const userRepo = AppDataSource.getRepository(User);
      const provider = await userRepo.findOne({
        where: { id: providerId, role: UserRole.PROVIDER },
      });

      if (!provider) {
        res.status(404).json({ success: false, message: "Provider not found" });
        return;
      }

      const scholarshipRepo = AppDataSource.getRepository(Scholarship);
      const scholarships = await scholarshipRepo.find({
        where: { provider_id: providerId },
        order: { created_at: "DESC" },
      });

      res.json({
        success: true,
        data: scholarships,
        count: scholarships.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch provider scholarships",
        error: error.message,
      });
    }
  }
}
