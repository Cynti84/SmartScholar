import { Router } from "express";
import { MatchingController } from "../controllers/matching.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new MatchingController();

router.get(
  "/recommendations",
  AuthMiddleware.authenticate,
  controller.getRecommendations
);

export default router;
