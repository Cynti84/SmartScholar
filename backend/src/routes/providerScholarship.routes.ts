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

const router = Router();

router.post(
  "/scholarships",
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
