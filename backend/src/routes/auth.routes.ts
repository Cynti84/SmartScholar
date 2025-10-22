import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../utils/validation.util";

const router = Router();

// Public routes
router.post("/signup", signupValidation, AuthController.signup);
router.post("/login", loginValidation, AuthController.login);
router.get("/verify-email", AuthController.resendVerification);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  AuthController.forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  AuthController.resetPassword
);
router.post("/resend-verification", AuthController.resendVerification);
router.post("/refresh-token", AuthController.refreshToken);

// Protected routes
router.get("/me", AuthMiddleware.authenticate, AuthController.getCurrentUser);
router.post("/logout", AuthMiddleware.authenticate, AuthController.logout);

export default router;
