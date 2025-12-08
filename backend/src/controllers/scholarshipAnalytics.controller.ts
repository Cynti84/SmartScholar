import { Request, Response } from "express";
import { scholarshipAnalyticsService } from "../services/scholarshipAnalytics.service";

export const getScholarshipApplications = async (
  req: Request,
  res: Response
) => {
  const providerId = req.user!.id;
  const scholarshipId = Number(req.params.id);

  const data = await scholarshipAnalyticsService.getApplications(
    providerId,
    scholarshipId
  );
  return res.status(200).json(data);
};

export const getScholarshipApplicationCount = async (
  req: Request,
  res: Response
) => {
  const providerId = req.user!.id;
  const scholarshipId = Number(req.params.id);

  const result = await scholarshipAnalyticsService.getApplicationCount(
    providerId,
    scholarshipId
  );
  return res.status(200).json(result);
};

export const getMostPopularScholarship = async (
  req: Request,
  res: Response
) => {
  const providerId = req.user!.id;

  const result = await scholarshipAnalyticsService.getMostPopularScholarship(
    providerId
  );
  return res.status(200).json(result);
};

export const getScholarshipDeadline = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const scholarshipId = Number(req.params.id);

  const result = await scholarshipAnalyticsService.getScholarshipDeadline(
    providerId,
    scholarshipId
  );
  return res.status(200).json(result);
};

export const getDashboardSummary = async (req: Request, res: Response) => {
  const providerId = req.user!.id;

  const result = await scholarshipAnalyticsService.getDashboardSummary(
    providerId
  );
  return res.status(200).json(result);
};
