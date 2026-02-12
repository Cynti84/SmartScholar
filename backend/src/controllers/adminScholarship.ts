import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";
export class AdminScholarship {
  static async updateScholarship(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const repo = AppDataSource.getRepository(Scholarship);

      const scholarship = await repo.findOne({ where: { scholarship_id: id } });

      if (!scholarship) {
        return res
          .status(404)
          .json({ success: false, message: "Scholarship not found" });
      }

      repo.merge(scholarship, req.body);
      await repo.save(scholarship);

      return res.json({
        success: true,
        message: "Scholarship updated successfully",
        scholarship,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update scholarship",
      });
    }
  }

  //Delete Scholarship
  static async deleteScholarship(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const repo = AppDataSource.getRepository(Scholarship);

      const scholarship = await repo.findOne({ where: { scholarship_id: id } });

      if (!scholarship) {
        return res
          .status(404)
          .json({ success: false, message: "Scholarship not found" });
      }

      await repo.remove(scholarship);

      return res.json({
        success: true,
        message: "Scholarship deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete scholarship",
      });
    }
  }

  //Approve scholarship
  static async approveScholarship(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const repo = AppDataSource.getRepository(Scholarship);

      const scholarship = await repo.findOne({ where: { scholarship_id: id } });

      if (!scholarship) {
        return res
          .status(404)
          .json({ success: false, message: "Scholarship not found" });
      }

      if (scholarship.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Only pending scholarships can be approved",
        });
      }

      scholarship.status = "approved";
      await repo.save(scholarship);

      return res.json({
        success: true,
        message: "Scholarship approved successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to approve scholarship",
      });
    }
  }

  //decline scholarship
  static async rejectScholarship(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { admin_notes } = req.body;

      const repo = AppDataSource.getRepository(Scholarship);
      const scholarship = await repo.findOne({ where: { scholarship_id: id } });

      if (!scholarship) {
        return res
          .status(404)
          .json({ success: false, message: "Scholarship not found" });
      }

      scholarship.status = "rejected";
      scholarship.admin_notes = admin_notes || null;

      await repo.save(scholarship);

      return res.json({
        success: true,
        message: "Scholarship rejected",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to reject scholarship",
      });
    }
  }

  //
}
