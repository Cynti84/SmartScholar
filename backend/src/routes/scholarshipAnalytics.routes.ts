import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  getScholarshipApplications,
  getScholarshipApplicationCount,
  getScholarshipDeadline,
  getDashboardSummary,
  getApplicantsByEducationLevel,
  getApplicantsByField,
  getApplicantsByCountry,
  getScholarshipOverview,
  getTotalApplicationsCount,
  getSoonestScholarshipDeadline,
} from "../controllers/scholarshipAnalytics.controller";

const router = Router();

// get all applicants
router.get(
  "/scholarships/:id/applications",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipApplications
);

// get number of applicants
router.get(
  "/scholarships/:id/applications/count",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipApplicationCount
);

// get scholarship deadline
router.get(
  "/scholarships/:id/deadline",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipDeadline
);

// get provider dashboard summary
router.get(
  "/dashboard/summary",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getDashboardSummary
);

// get applicants by education level
router.get(
  "/applicants/education-level",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getApplicantsByEducationLevel
);

// get applicants by field
router.get(
  "/applicants/field",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getApplicantsByField
);

// get applicants by country
router.get(
  "/applicants/country",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getApplicantsByCountry
);

router.get(
  "/applications/count",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getTotalApplicationsCount
);

router.get(
  "/scholarships/deadline/soonest",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getSoonestScholarshipDeadline
);

export default router;
