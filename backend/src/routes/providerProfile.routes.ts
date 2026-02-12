import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  createProviderProfile,
  getProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
  // updateProviderPreferences,
} from "../controllers/providerProfile.controller";
import { upload } from "../config/multer.config";

const router = Router();

router.post(
  "/create",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  upload.fields([
    { name: "logoFile", maxCount: 1 },
    { name: "verificationDocument", maxCount: 5 },
  ]),
  createProviderProfile,
);
router.get(
  "/get",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getProviderProfile,
);
router.put(
  "/update",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  upload.fields([
    { name: "logoFile", maxCount: 1 },
    { name: "verificationDocument", maxCount: 5 },
  ]),
  updateProviderProfile,
);

router.delete(
  "/delete",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  deleteProviderProfile,
);

export default router;
