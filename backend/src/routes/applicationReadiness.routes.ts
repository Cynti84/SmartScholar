import { Router } from "express";
import { ApplicationReadinessController } from "../controllers/applicationReadiness.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new ApplicationReadinessController();

/**
 * @route   POST /api/student/scholarships/:scholarshipId/check-readiness
 * @desc    Check if student is ready to apply for a scholarship
 * @access  Private (Student only)
 */

router.post(
  "/scholarships/:scholarshipId/check-readiness",
  AuthMiddleware.authenticate,
  controller.checkReadiness
);

export default router;
