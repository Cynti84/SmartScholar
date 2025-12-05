import { Router, RequestHandler } from "express";

import { authConfig } from "../config/auth.config";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  createStudentProfile,
  updateStudentProfile,
  deleteProfile,
  logout,
  enable2FA,
  verify2FA,
  disable2FA,
} from "../controllers/student.user.controller";

const router = Router();

router.post("/profile", AuthMiddleware.authenticate, createStudentProfile);

router.put(
  "/update-profile",
  AuthMiddleware.authenticate,
  updateStudentProfile
);

router.delete(
  "/delete-profile",
  AuthMiddleware.authenticate,
  AuthMiddleware.isStudent,
  deleteProfile
);

router.post("/logout", AuthMiddleware.authenticate, logout);

//2FA
router.post("/2fa/enable", AuthMiddleware.authenticate, enable2FA);
router.post("/2fa/verify-2fa", AuthMiddleware.authenticate, verify2FA);
router.post("/2fa/disable-2fa", AuthMiddleware.authenticate, disable2FA);

export default router;
