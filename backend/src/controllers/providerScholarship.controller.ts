import { Request, Response } from "express";
import { providerScholarshipSerivice } from "../services/providerScholarship.service";

export const createScholarship = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const files = req.files as Record<string, Express.Multer.File[]>;

  const flyerUrl = files?.flyer?.[0]?.path ?? null;
  const bannerUrl = files?.banner?.[0]?.path ?? null;

  const verificationDocs = files?.verificationDocuments
    ? files.verificationDocuments.map((file) => file.path)
    : [];

  const result = await providerScholarshipSerivice.createScholarship(
    providerId,
    {
      ...req.body,
      flyer_url: flyerUrl,
      banner_url: bannerUrl,
      verification_docs: verificationDocs,
      status: "pending", // force review
    }
  );
  return res.status(201).json(result);
};

export const getAllScholarships = async (req: Request, res: Response) => {
  const providerId = req.user!.id;

  const result = await providerScholarshipSerivice.getAllProviderScholarships(
    providerId
  );
  return res.status(200).json(result);
};

export const getScholarshipById = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Scholarship ID",
    });
  }

  const result = await providerScholarshipSerivice.getScholarshipById(
    providerId,
    id
  );
  return res.status(200).json(result);
};

export const updateScholarship = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const id = Number(req.params.id);
  const data = req.body;

  const result = await providerScholarshipSerivice.updateScholarship(
    providerId,
    id,
    data
  );
  return res.status(200).json(result);
};

export const deleteScholarship = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const id = Number(req.params.id);

  const result = await providerScholarshipSerivice.deleteScholarship(
    providerId,
    id
  );
  return res.status(200).json(result);
};
