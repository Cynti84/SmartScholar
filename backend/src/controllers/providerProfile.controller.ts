import { Request, Response } from "express";
import { providerProfileService } from "../services/providerProfile.service";
import { UpdatedAt } from "sequelize-typescript";

export const createProviderProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data = req.body;

  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  const logoUrl = files?.logoFile?.[0]?.path ?? null;

  const verificationDocs = files?.verificationDocument
    ? files.verificationDocument.map((file) => file.path)
    : [];

  const result = await providerProfileService.createProfile(userId, {
    ...data,
    logo_url: logoUrl,
    verification_docs: verificationDocs,
  });

  return res.status(201).json(result);
};

export const getProviderProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const result = await providerProfileService.getProfile(userId);
  return res.status(200).json(result);
};

export const updateProviderProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const data = req.body;

  const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  const logoUrl = files?.logoFile?.[0]?.path;
  const verificationDocs = files?.verificationDocument
    ? files.verificationDocument.map((file) => file.path)
    : undefined;

  const updateData: any = {
    ...data,
  };
  // Merge preferences explicitly
  if (data.preferences) {
    try {
      updateData.preferences = JSON.parse(data.preferences);
    } catch (err) {
      console.error("Failed to parse preferences", err);
      updateData.preferences = {};
    }
  }
  // replace logo
  if (logoUrl) {
    updateData.logo_url = logoUrl;
  }

  // remove logo
  if (req.body.remove_logo === "true") {
    updateData.logo_url = null;
  }

  // update verification docs
  if (verificationDocs) {
    updateData.verification_docs = verificationDocs;
  }

  const result = await providerProfileService.updateProfile(userId, updateData);

  return res.status(200).json(result);
};

export const deleteProviderProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  await providerProfileService.deleteProfile(userId);

  return res
    .status(200)
    .json({ message: "Provider profile deleted successfully." });
};

// export const updateProviderPreferences = async (
//   req: Request,
//   res: Response,
// ) => {
//   const userId = req.user!.id;
//   const preferences = req.body;

//   try {
//     const result = await providerProfileService.updatePreferences(
//       userId,
//       preferences,
//     );
//     return res.status(200).json({
//       message: "Preferences updated successfully",
//       preferences: result.preferences,
//     });
//   } catch (err: any) {
//     console.error(err);
//     return res.status(500).json({ message: err.message || "Server error" });
//   }
// };
