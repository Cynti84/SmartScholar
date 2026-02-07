import { Router } from "express";
import { ApplicationAssistantController } from "../controllers/applicationAssistant.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new ApplicationAssistantController();

// All routes require authentication
router.use(AuthMiddleware.authenticate);

/**
 * GET /api/student/application-assistant/checklist/:scholarshipId
 * Generate document checklist for scholarship application
 */
router.get(
  "/checklist/:scholarshipId",
  controller.getDocumentChecklist.bind(controller)
);

/**
 * GET /api/student/application-assistant/interview-questions/:scholarshipId
 * Generate likely interview questions for scholarship
 */
router.get(
  "/interview-questions/:scholarshipId",
  controller.getInterviewQuestions.bind(controller)
);

/**
 * GET /api/student/application-assistant/tips/:scholarshipId
 * Generate personalized application tips
 */
router.get(
  "/tips/:scholarshipId",
  controller.getApplicationTips.bind(controller)
);

/**
 * POST /api/student/application-assistant/review-essay/:scholarshipId
 * Review student's essay/personal statement
 * Body: { essay: string }
 */
router.post(
  "/review-essay/:scholarshipId",
  controller.reviewEssay.bind(controller)
);

export default router;
