import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  createProviderProfile,
  getProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
} from "../controllers/providerProfile.controller";

const router = Router();

router.post(
  "/create",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  createProviderProfile
);
router.get(
  "/get",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getProviderProfile
);
router.put(
  "/update",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  updateProviderProfile
);
router.delete(
  "/delete",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  deleteProviderProfile
);

export default router;
