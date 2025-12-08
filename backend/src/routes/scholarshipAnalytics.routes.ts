import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  getScholarshipApplications,
  getScholarshipApplicationCount,
  getMostPopularScholarship,
  getScholarshipDeadline,
  getDashboardSummary,
} from "../controllers/scholarshipAnalytics.controller";

const router = Router();

router.get(
  "/scholarships/:id/applications",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipApplications
);

router.get(
  "/scholarships/:id/applications/count",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipApplicationCount
);

router.get(
  "/scholarships/popular",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getMostPopularScholarship
);

router.get(
  "/scholarships/:id/deadline",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipDeadline
);

router.get(
  "/dashboard/summary",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getDashboardSummary
);

export default router;
