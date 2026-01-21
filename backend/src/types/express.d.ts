import { UserRole, UserStatus } from "./auth.types";

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

export {};
