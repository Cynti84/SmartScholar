import { Request, Response } from "express";
import { providerProfileService } from "../services/providerProfile.service";
export const createProviderProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const data = req.body;

  const result = await providerProfileService.createProfile(req.user!.id, data);
  return res.status(201).json(result);
};

export const getProviderProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const result = await providerProfileService.getProfile(req.user!.id);
  return res.status(200).json(result);
};

export const updateProviderProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const data = req.body;

  const result = await providerProfileService.updateProfile(req.user!.id, data);
  return res.status(200).json(result);
};

export const deleteProviderProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await providerProfileService.deleteProfile(req.user!.id);
  return res
    .status(200)
    .json({ message: "Provider profile deleted successfully." });
};
