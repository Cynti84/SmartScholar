import { Router } from "express";
import { FraudDetectionController } from "../controllers/fraud-detection.controller";
import {
  authenticateAdmin,
  adminRateLimiter,
} from "../middleware/admin.Middleware";
const router = Router();
const controller = new FraudDetectionController();

// All routes require admin authentication
router.use(authenticateAdmin);
router.use(adminRateLimiter);

/**
 * Analyze single scholarship for fraud
 */
router.get(
  "/analyze/:scholarshipId",
  controller.analyzeScholarship.bind(controller)
);

/**
 * Analyze multiple scholarships at once
 */
router.post("/batch-analyze", controller.batchAnalyze.bind(controller));

/**
 * Get all high-risk pending scholarships
 */
router.get("/high-risk", controller.getHighRiskScholarships.bind(controller));

export default router;
