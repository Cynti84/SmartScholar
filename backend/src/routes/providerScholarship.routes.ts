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
} from "../controllers/scholarshipAnalytics.controller";

const router = Router();

// create a new scholarship
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

// get all scholarships
router.get(
  "/scholarships",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getAllScholarships
);

// get scholarship overview
router.get(
  "/scholarships/overview",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipOverview
);
// get most popular scholarship
router.get(
  "/scholarships/popular",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getMostPopularScholarship
);

// get a specific scholarship
router.get(
  "/scholarships/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipById
);

// update a scholarship
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

// delete scholarship
router.delete(
  "/scholarships/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  deleteScholarship
);

export default router;
