import { Request, Response } from "express";
import { providerProfileService } from "../services/providerProfile.service";

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

  const result = await providerProfileService.updateProfile(userId, {
    ...data,
    ...(logoUrl && { logo_url: logoUrl }),
    ...(verificationDocs && { verification_docs: verificationDocs }),
  });

  return res.status(200).json(result);
};

export const deleteProviderProfile = async (req: Request, res: Response) => {
  const userId = req.user!.id;

  await providerProfileService.deleteProfile(userId);

  return res
    .status(200)
    .json({ message: "Provider profile deleted successfully." });
};
