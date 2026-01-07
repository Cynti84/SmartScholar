import { Router } from "express";
import {
  createScholarship,
  getAllScholarships,
  getScholarshipById,
  updateScholarship,
  deleteScholarship,
} from "../controllers/providerScholarship.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/scholarships",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  AuthMiddleware.requireActiveProvider,
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
  updateScholarship
);
router.delete(
  "/scholarships/:id",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  deleteScholarship
);

export default router;
