// src/controllers/scholarship.controller.ts
import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";

export const getLandingScholarships = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Scholarship);

    const scholarships = await repo.find({
      where: { status: "approved" }, // 👈 important
      order: { created_at: "DESC" },
      take: 4, // 👈 ONLY 4
    });

    return res.json({
      success: true,
      data: scholarships,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch scholarships",
    });
  }
};
