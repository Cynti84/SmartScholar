import { Router } from "express";
import { AIScholarshipDiscoveryController } from "../controllers/aiScholarshipDiscovery.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new AIScholarshipDiscoveryController();

/**
 * @route   POST /api/student/discover-scholarships
 * @desc    AI-powered natural language scholarship discovery
 * @access  Private (Student only)
 */
router.post(
  "/discover-scholarships",
  AuthMiddleware.authenticate,
  controller.discoverScholarships
);

export default router;
