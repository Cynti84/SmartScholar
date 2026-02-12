// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { PasswordUtil } from "../utils/password.util";
import { JWTUtil } from "../utils/jwt.util";
import { EmailUtil } from "../utils/email.util";
import {
  UserRole,
  UserStatus,
  SignupDTO,
  LoginDTO,
  AuthResponse,
  JwtPayloadData,
} from "../types/auth.types";
import { UserRepository } from "../repositories/user.repository";

// Extend Request to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
}

export class AuthController {
  /** SIGNUP */
  static async signup(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const signupData: SignupDTO = req.body;

      const existingUser = await UserRepository.findByEmail(signupData.email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
        return;
      }

      const hashedPassword = await PasswordUtil.hashPassword(
        signupData.password,
      );
      const verificationToken = PasswordUtil.generateToken();
      const verificationTokenExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );

      const newUser = await UserRepository.create({
        email: signupData.email,
        password: hashedPassword,
        role: signupData.role,
        status:
          signupData.role === UserRole.PROVIDER
            ? UserStatus.PENDING
            : UserStatus.ACTIVE,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        isEmailVerified: false,
        verificationToken,
        verificationTokenExpires,
      });

      await EmailUtil.sendVerificationEmail(
        newUser.email,
        newUser.firstName || "User",
        verificationToken,
      );

      const response: AuthResponse = {
        success: true,
        message:
          "Account created successfully! Please check your email to verify your account.",
        data: {
          user: {
            email: newUser.email,
            role: newUser.role,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
          },
        },
      };

      res.status(201).json(response);
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred during signup. Please try again.",
      });
    }
  }

  /** LOGIN */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body; // ⬅ role removed
      const user = await UserRepository.findByEmail(email);

      if (!user) {
        res.status(401).json({
          success: false,
          message: "user not found",
        });
        return;
      }

      const isPasswordValid = await PasswordUtil.comparePassword(
        password,
        user.password,
      );

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: "Wrong password",
        });
        return;
      }

      if (!user.isEmailVerified) {
        res.status(403).json({
          success: false,
          message: "Please verify your email address before logging in",
        });
        return;
      }

      if (user.status === UserStatus.SUSPENDED) {
        res.status(403).json({
          success: false,
          message: "Your account has been suspended. Please contact support.",
        });
        return;
      }

      // JWT payload uses actual DB role — not user input
      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      };

      const accessToken = JWTUtil.generateToken(payload);
      const refreshToken = JWTUtil.generateRefreshToken(payload);

      // Send success response
      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          accessToken,
          refreshToken,
          user: {
            userId: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            firstName: user.firstName,
            lastName: user.lastName,
            isEmailVerified: user.isEmailVerified,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred during login. Please try again.",
      });
    }
  }

  /** FORGOT PASSWORD */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return; // <-- make sure to RETURN here to stop execution
      }

      const { email } = req.body;
      const user = await UserRepository.findByEmail(email);

      const response = {
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      };

      if (!user) {
        res.status(200).json(response); // respond
        return; // <-- return to stop further execution
      }

      const resetToken = PasswordUtil.generateToken();
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

      await UserRepository.update(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires,
      });

      await EmailUtil.sendPasswordResetEmail(
        user.email,
        user.firstName || "User",
        resetToken,
      );

      res.status(200).json(response);
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred. Please try again.",
      });
    }
  }

  /** RESET PASSWORD */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return; // stop execution
      }

      const { token, password } = req.body;
      const user = await UserRepository.findByResetToken(token);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Invalid or expired reset token",
        });
        return; // stop execution
      }

      if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
        res.status(400).json({
          success: false,
          message: "Reset token has expired. Please request a new one.",
        });
        return; // stop execution
      }

      const hashedPassword = await PasswordUtil.hashPassword(password);
      await UserRepository.update(user.id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      });

      res.status(200).json({
        success: true,
        message: "Password reset successfully! You can now log in.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred. Please try again.",
      });
    }
  }

  /** VERIFY EMAIL */
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const token = req.query.token as string;
      if (!token) {
        res
          .status(400)
          .json({ success: false, message: "Verification token is required" });
        return;
      }

      const user = await UserRepository.findByVerificationToken(token);
      if (!user) {
        res
          .status(400)
          .json({ success: false, message: "Invalid or expired token" });
        return;
      }

      // Check if token has expired
      if (
        user.verificationTokenExpires &&
        new Date() > user.verificationTokenExpires
      ) {
        res
          .status(400)
          .json({ success: false, message: "Verification token has expired" });
        return;
      }

      // Mark user as verified
      user.isEmailVerified = true;
      // user.verificationToken = null;
      // user.verificationTokenExpires = null;

      await UserRepository.update(user.id, user);

      // Optionally send a welcome email
      await EmailUtil.sendWelcomeEmail(
        user.email,
        user.firstName || "User",
        user.role,
      );

      res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Email Verified</title>
  <style>
    body { font-family: Arial; background: #f4f6f8; }
    .box {
      max-width: 400px;
      margin: 100px auto;
      background: white;
      padding: 30px;
      border-radius: 10px;
      text-align: center;
    }
    a {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 25px;
      background: #667eea ;
      color: white;
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <div class="box">
    <h1>✅ Email Verified</h1>
    <p>Your account has been successfully verified.</p>
    <a href="http://localhost:4200/auth/login">Go to Login</a>
  </div>
</body>
</html>
`);
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify email. Please try again.",
      });
    }
  }

  /** GET CURRENT USER */
  static async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: "Not authenticated" });
        return; // stop further execution
      }

      const user = await UserRepository.findById(req.user.id);
      if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ success: false, message: "An error occurred" });
    }
  }

  /** RESEND VERIFICATION EMAIL */
  static async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: "Email is required" });
        return;
      }

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "No account found with this email",
        });
        return;
      }

      if (user.isEmailVerified) {
        res
          .status(400)
          .json({ success: false, message: "Email is already verified" });
        return;
      }

      const verificationToken = PasswordUtil.generateToken();
      const verificationTokenExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      );

      await UserRepository.update(user.id, {
        verificationToken,
        verificationTokenExpires,
      });
      await EmailUtil.sendVerificationEmail(
        user.email,
        user.firstName || "User",
        verificationToken,
      );

      res.status(200).json({
        success: true,
        message: "Verification email sent successfully",
      });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred. Please try again.",
      });
    }
  }

  /** LOGOUT */
  static async logout(req: Request, res: Response): Promise<void> {
    res.status(200).json({ success: true, message: "Logged out successfully" });
  }

  /** REFRESH TOKEN */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res
          .status(400)
          .json({ success: false, message: "Refresh token is required" });
        return; // stop execution
      }

      function isJwtPayloadData(v: any): v is JwtPayloadData {
        return v && typeof v === "object" && typeof v.id === "string"; // adjust checks as needed
      }

      const decoded = JWTUtil.verifyToken(refreshToken);
      if (!isJwtPayloadData(decoded)) {
        throw new Error("Invalid token payload");
      }

      const newToken = JWTUtil.generateToken({
        email: decoded.email,
        role: decoded.role,
        status: decoded.status,
        id: decoded.id,
      });
      res.status(200).json({ success: true, data: { token: newToken } });
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }
  }
  // Change password
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const userId = req.user?.id; // from auth middleware
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await UserRepository.findById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // 1️⃣ Verify current password
      const isPasswordValid = await PasswordUtil.comparePassword(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
        return;
      }

      // 2️⃣ Prevent reusing same password
      const isSamePassword = await PasswordUtil.comparePassword(
        newPassword,
        user.password,
      );

      if (isSamePassword) {
        res.status(400).json({
          success: false,
          message: "New password must be different from the current password",
        });
        return;
      }

      // 3️⃣ Hash & save new password
      const hashedPassword = await PasswordUtil.hashPassword(newPassword);

      await UserRepository.update(user.id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
      });

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred. Please try again.",
      });
    }
  }
}
