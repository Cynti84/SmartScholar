import { Router, RequestHandler } from "express";
import { upload } from "../config/multer.config";
import { authConfig } from "../config/auth.config";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  createStudentProfile,
  updateStudentProfile,
  deleteProfile,
  logout,
  enable2FA,
  verify2FA,
  disable2FA,
  getScholarshipsForStudent,
  getScholarshipById,
  getActiveScholarships,
  bookmarkScholarship,
  getBookmarkedScholarships,
  markScholarshipAsApplied,
  getAppliedScholarships,
  getTotalApplied,
  getExpiredApplied,
  removeBookmark,
  downloadStudentProfile,
  getStudentProfileById,
  get2FAStatus,
  getLoggedInStudentProfile,
  getStudentProfile,
} from "../controllers/student.user.controller";
import {
  getEmailPreferences,
  updateEmailPreferences,
} from "../controllers/email-preference.controller";
import { recordScholarshipView } from "../controllers/scholarshipAnalytics.controller";

import { MatchingController } from "../controllers/matching.controller";

const controller = new MatchingController();

const router = Router();

router.post(
  "/profile",
  AuthMiddleware.authenticate,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "cvFile", maxCount: 1 },
  ]),
  createStudentProfile
);

router.put(
  "/update-profile",
  AuthMiddleware.authenticate,
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "cvFile", maxCount: 1 },
  ]),
  updateStudentProfile
);

router.get("/profile", AuthMiddleware.authenticate, getStudentProfile);
// router.get("/profile", AuthMiddleware.authenticate, getLoggedInStudentProfile);
// router.get("/profile/:id", AuthMiddleware.authenticate, getStudentProfileById);

router.delete(
  "/delete-profile",
  AuthMiddleware.authenticate,
  AuthMiddleware.isStudent,
  deleteProfile
);
router.get(
  "/profile/download",
  AuthMiddleware.authenticate,
  downloadStudentProfile
);

router.post("/logout", AuthMiddleware.authenticate, logout);

//2FA
router.post("/2fa/enable", AuthMiddleware.authenticate, enable2FA);
router.post("/2fa/verify-2fa", AuthMiddleware.authenticate, verify2FA);
router.get("/2fa/status", AuthMiddleware.authenticate, get2FAStatus);

router.post("/2fa/disable-2fa", AuthMiddleware.authenticate, disable2FA);

router.get(
  "/email-preferences",
  AuthMiddleware.authenticate,
  getEmailPreferences
);
router.put(
  "/email-preferences",
  AuthMiddleware.authenticate,
  updateEmailPreferences
);

//scholarshipfor students
router.get(
  "/scholarships",
  AuthMiddleware.authenticate,
  getScholarshipsForStudent
);
router.get(
  "/scholarships/active-scholarship",
  AuthMiddleware.authenticate,
  getActiveScholarships
);

router.get(
  "/scholarships/recommendations",
  AuthMiddleware.authenticate,
  controller.getRecommendations
);

router.post(
  "/scholarships/:scholarshipId/bookmark",
  AuthMiddleware.authenticate,
  bookmarkScholarship
);

router.get(
  "/scholarships/bookmarked",
  AuthMiddleware.authenticate,
  getBookmarkedScholarships
);

router.delete(
  "/scholarships/:scholarshipId/bookmark",
  AuthMiddleware.authenticate,
  removeBookmark
);

router.post(
  "/scholarships/:scholarshipId/apply",
  AuthMiddleware.authenticate,
  markScholarshipAsApplied
);

router.get(
  "/scholarships/applied",
  AuthMiddleware.authenticate,
  getAppliedScholarships
);

router.get(
  "/scholarships/applied/total",
  AuthMiddleware.authenticate,
  getTotalApplied
);

router.get(
  "/scholarships/applied/expired",
  AuthMiddleware.authenticate,
  getExpiredApplied
);
router.get(
  "/scholarships/:id",
  AuthMiddleware.authenticate,
  getScholarshipById
);

// called when a student opens a scholarship detail page
router.post(
  "/scholarships/:id/view",
  AuthMiddleware.authenticate,
  recordScholarshipView
);

export default router;
