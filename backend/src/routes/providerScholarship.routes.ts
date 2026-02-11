import { Router } from "express";
import {
  createScholarship,
  getAllScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
} from "../controllers/providerScholarship.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import { upload } from "../config/multer.config";
import {
  getMostPopularScholarship,
  getScholarshipOverview,
  getScholarshipApplicationCount,
  getScholarshipViewCount,
  getScholarshipBookmarkCount,
  getScholarshipAnalytics,
} from "../controllers/scholarshipAnalytics.controller";

const router = Router();

// ─── Scholarship CRUD ────────────────────────────────────────────────────────

router.post(
  "/scholarships/post",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  AuthMiddleware.requireActiveProvider,
  upload.fields([
    { name: "flyer", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "verificationDocument", maxCount: 5 },
  ]),
  createScholarship
);

router.get(
  "/scholarships",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getAllScholarships
);

// ── Static/named routes MUST come before /:id ────────────────────────────────

router.get(
  "/scholarships/overview",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipOverview
);

router.get(
  "/scholarships/popular",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getMostPopularScholarship
);

// ─── Per-scholarship analytics ───────────────────────────────────────────────

/**
 * GET /api/provider/scholarships/:id/analytics
 * Returns { views, bookmarks, applications } for one scholarship.
 * This is the single endpoint the manage-scholarships page calls per row.
 */
router.get(
  "/scholarships/:id/analytics",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipAnalytics
);

/**
 * GET /api/provider/scholarships/:id/applications/count
 * Already implemented — kept here for completeness.
 */
router.get(
  "/scholarships/:id/applications/count",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipApplicationCount
);

/**
 * GET /api/provider/scholarships/:id/views/count
 */
router.get(
  "/scholarships/:id/views/count",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipViewCount
);

/**
 * GET /api/provider/scholarships/:id/bookmarks/count
 */
router.get(
  "/scholarships/:id/bookmarks/count",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipBookmarkCount
);

// ─── Single scholarship (keep AFTER all /scholarships/:id/sub-routes) ────────

router.get(
  "/scholarships/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipById
);

router.put(
  "/scholarships/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  upload.fields([
    { name: "flyer", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "verificationDocuments", maxCount: 5 },
  ]),
  updateScholarship
);

router.delete(
  "/scholarships/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  deleteScholarship
);

export default router;
