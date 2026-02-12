import { Request, Response, NextFunction } from "express";
import { JWTUtil } from "../utils/jwt.util";
import { UserRole, UserStatus } from "../types/auth.types";
import { AppDataSource } from "../utils/db";
import { User } from "../models/users";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
        status: UserStatus;
      };
    }
  }
}

export class AuthMiddleware {
  /**
   * Verify JWT token and attach user to request
   */
  static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({
          success: false,
          message: "No token provided. Authentication required.",
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = JWTUtil.verifyToken(token);

      // Ensure user account is active
      // if (decoded.status !== UserStatus.ACTIVE) {
      //   res.status(403).json({
      //     success: false,
      //     message: "Account is not active. Please contact support.",
      //   });
      //   return;
      // }
      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        status: decoded.status,
      };

      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }
  }

  /**
   * Authorize based on user role(s)
   */
  static authorize(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource.",
        });
        return;
      }

      next();
    };
  }

  static async requireActiveProvider(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      if (req.user.role !== UserRole.PROVIDER) {
        res.status(403).json({
          success: false,
          message: "This endpoint is for providers only.",
        });
        return;
      }

      // ✅ CHECK DATABASE IN REAL-TIME (not just JWT token)
      const userRepo = AppDataSource.getRepository(User);
      const provider = await userRepo.findOne({
        where: { id: req.user.id },
        relations: ["providerProfile"],
      });

      if (!provider) {
        res.status(404).json({
          success: false,
          message: "Provider account not found.",
        });
        return;
      }

      // Check if user status is active
      if (provider.status !== UserStatus.ACTIVE) {
        res.status(403).json({
          success: false,
          message:
            "Your account is pending admin approval. You cannot post scholarships yet.",
        });
        return;
      }

      // Check if provider profile exists and is verified
      if (!provider.providerProfile) {
        res.status(403).json({
          success: false,
          message:
            "Provider profile not found. Please complete your profile setup.",
        });
        return;
      }

      if (!provider.providerProfile.verified) {
        res.status(403).json({
          success: false,
          message:
            "Your provider profile is not verified. Please wait for admin approval or contact support.",
        });
        return;
      }

      // ✅ All checks passed - update request with fresh user data from database
      req.user = {
        id: provider.id,
        email: provider.email,
        role: provider.role,
        status: provider.status, // ← Fresh from database, not from JWT
      };

      next();
    } catch (error) {
      console.error("Provider verification error:", error);
      res.status(500).json({
        success: false,
        message: "Error verifying provider status. Please try again.",
      });
    }
  }

  static isAdmin(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(UserRole.ADMIN)(req, res, next);
  }

  static isStudent(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(UserRole.STUDENT)(req, res, next);
  }

  static isProvider(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.authorize(UserRole.PROVIDER)(req, res, next);
  }

  static isStudentOrProvider(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    AuthMiddleware.authorize(UserRole.STUDENT, UserRole.PROVIDER)(
      req,
      res,
      next
    );
  }
}
