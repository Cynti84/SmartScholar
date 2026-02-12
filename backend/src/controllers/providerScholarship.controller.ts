import { Request, Response } from "express";
import { providerScholarshipSerivice } from "../services/providerScholarship.service";

export const createScholarship = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const files = req.files as Record<string, Express.Multer.File[]>;

  // ✅ ADD DEBUGGING
  console.log("🔍 CREATE SCHOLARSHIP DEBUG:");
  console.log("Files received:", Object.keys(files || {}));
  console.log("Full files object:", JSON.stringify(files, null, 2));

  const flyerUrl = files?.flyer?.[0]?.path ?? null;
  const bannerUrl = files?.banner?.[0]?.path ?? null;

  const verificationDocs = files?.verificationDocuments
    ? files.verificationDocuments.map((file) => file.path)
    : [];

  // ✅ ADD DEBUGGING
  console.log("📄 Extracted data:");
  console.log("  Flyer URL:", flyerUrl);
  console.log("  Banner URL:", bannerUrl);
  console.log("  Verification Docs:", verificationDocs);
  console.log("  Number of docs:", verificationDocs.length);

  const payload = {
    ...req.body,
    flyer_url: flyerUrl,
    banner_url: bannerUrl,
    verification_docs: verificationDocs,
    status: "pending",
  };

  console.log("💾 Final payload:", JSON.stringify(payload, null, 2));

  const result = await providerScholarshipSerivice.createScholarship(
    providerId,
    payload
  );

  console.log("✅ Created scholarship result:", result);

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
