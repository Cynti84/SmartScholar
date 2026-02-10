// backend/src/routes/posting-assistant.routes.ts

import { Router } from "express";
import { PostingAssistantController } from "../controllers/posting-assistance.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
const router = Router();
const controller = new PostingAssistantController();

// All routes require provider authentication
router.use(AuthMiddleware.authenticate);

/**
 * POST /api/provider/posting-assistant/polish-text
 * Polish/improve text with AI
 * Body: { text: string, fieldType: string, context?: object }
 */
router.post("/polish-text", controller.polishText.bind(controller));

/**
 * POST /api/provider/posting-assistant/analyze-completeness
 * Analyze form completeness and get score
 * Body: { formData: object }
 */
router.post(
  "/analyze-completeness",
  controller.analyzeCompleteness.bind(controller)
);

/**
 * POST /api/provider/posting-assistant/generate-suggestion
 * Generate content suggestions for fields
 * Body: { fieldType: string, context: object }
 */
router.post(
  "/generate-suggestion",
  controller.generateSuggestion.bind(controller)
);

export default router;
