import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { EmailPreference } from "../models/email_preferences";
import { AuthRequest } from "../types/auth-request";

export const getEmailPreferences = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  const repo = AppDataSource.getRepository(EmailPreference);

  let preferences = await repo.findOne({
    where: { user: { id: userId } },
    relations: ["user"],
  });

  // Create defaults if none exist
  if (!preferences) {
    preferences = repo.create({
      user: { id: userId } as any,
    });
    await repo.save(preferences);
  }

  return res.status(200).json({
    success: true,
    data: preferences,
  });
};

export const updateEmailPreferences = async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const userId = authReq.user!.id;

  const repo = AppDataSource.getRepository(EmailPreference);

  let preferences = await repo.findOne({
    where: { user: { id: userId } },
    relations: ["user"],
  });

  if (!preferences) {
    preferences = repo.create({
      user: { id: userId } as any,
    });
  }

  repo.merge(preferences, req.body);
  await repo.save(preferences);

  return res.status(200).json({
    success: true,
    message: "Email preferences updated successfully",
    data: preferences,
  });
};
