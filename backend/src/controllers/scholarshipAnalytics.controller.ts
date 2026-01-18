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

export const getApplicantsByEducationLevel = async (
  req: Request,
  res: Response
) => {
  const providerId = req.user!.id;
  const scholarshipId = req.query.scholarshipId
    ? Number(req.query.scholarshipId)
    : undefined;

  const data = await scholarshipAnalyticsService.getApplicantsByEducationLevel(
    providerId,
    scholarshipId
  );

  res.json(data);
};

export const getApplicantsByField = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const scholarshipId = req.query.scholarshipId
    ? Number(req.query.scholarshipId)
    : undefined;

  const data = await scholarshipAnalyticsService.getApplicantsByField(
    providerId,
    scholarshipId
  );

  res.json(data);
};

export const getApplicantsByCountry = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const scholarshipId = req.query.scholarshipId
    ? Number(req.query.scholarshipId)
    : undefined;

  const data = await scholarshipAnalyticsService.getApplicantsByCountry(
    providerId,
    scholarshipId
  );

  res.json(data);
};

export const getScholarshipOverview = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const data = await scholarshipAnalyticsService.getScholarshipOverview(
    providerId
  );
  res.json(data);
};

export const getTotalApplicationsCount = async (
  req: Request,
  res: Response
) => {
  const providerId = req.user!.id;

  const result = await scholarshipAnalyticsService.getTotalApplicationsCount(
    providerId
  );

  res.json(result);
};

export const getSoonestScholarshipDeadline = async (
  req: Request,
  res: Response
) => {
  const providerId = req.user!.id;

  const data = await scholarshipAnalyticsService.getSoonestScholarshipDeadline(
    providerId
  );

  res.json(data);
};
