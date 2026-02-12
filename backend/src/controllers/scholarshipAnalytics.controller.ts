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

// ─── NEW: per-scholarship analytics ──────────────────────────────────────────

/**
 * GET /api/provider/scholarships/:id/views/count
 * Returns unique view count for one scholarship.
 */
export const getScholarshipViewCount = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const scholarshipId = Number(req.params.id);

  const result = await scholarshipAnalyticsService.getViewCount(
    providerId,
    scholarshipId
  );
  return res.status(200).json(result);
};

/**
 * GET /api/provider/scholarships/:id/bookmarks/count
 * Returns bookmark count for one scholarship.
 */
export const getScholarshipBookmarkCount = async (
  req: Request,
  res: Response
) => {
  const providerId = req.user!.id;
  const scholarshipId = Number(req.params.id);

  const result = await scholarshipAnalyticsService.getBookmarkCount(
    providerId,
    scholarshipId
  );
  return res.status(200).json(result);
};

/**
 * GET /api/provider/scholarships/:id/analytics
 * Returns views + bookmarks + applications in one call.
 * Used by the manage-scholarships page.
 */
export const getScholarshipAnalytics = async (req: Request, res: Response) => {
  const providerId = req.user!.id;
  const scholarshipId = Number(req.params.id);

  const result = await scholarshipAnalyticsService.getScholarshipAnalytics(
    providerId,
    scholarshipId
  );
  return res.status(200).json(result);
};

// ─── NEW: record a view (called from student side) ───────────────────────────

/**
 * POST /api/scholarships/:id/view
 * Records a unique view for the authenticated student.
 * Safe to call multiple times — duplicate is silently ignored.
 */
export const recordScholarshipView = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const scholarshipId = Number(req.params.id);

  await scholarshipAnalyticsService.recordView(userId, scholarshipId);
  return res.status(200).json({ success: true });
};
