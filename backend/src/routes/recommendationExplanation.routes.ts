import { Router } from "express";
import { RecommendationExplanationController } from "../controllers/recommendationExplanation.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new RecommendationExplanationController();

router.get(
  "/recommendations/:matchId/explanation",
  AuthMiddleware.authenticate,
  controller.getExplanation.bind(controller)
);

export default router;
