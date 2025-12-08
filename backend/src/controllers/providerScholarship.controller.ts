import { Request, Response } from "express";
import { providerScholarshipSerivice } from "../services/providerScholarship.service";

export const createScholarship = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const data = req.body;

  const result = await providerScholarshipSerivice.createScholarship(
    providerId,
    data
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
