import { Request, Response, NextFunction } from "express";
import { JWTUtil } from "../utils/jwt.util";
import { UserRole, UserStatus } from "../types/auth.types";

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

  static requireActiveProvider(req: Request, res: Response, next: NextFunction): void{
    if (!req.user) {
      res.status(401).json({ message: "Authentication required." })
      return

    }

    if (req.user.role !== UserRole.PROVIDER) {
      res.status(403).json({ message: "Providers only." })
      return
    }

    if (req.user.status !== UserStatus.ACTIVE) {
      res.status(403).json({
        message: " Your account is pending verification. You cannot post scholarships yet"
      })
      return
    }

    next()
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
