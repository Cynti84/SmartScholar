import { Request } from "express";
import { UserRole, UserStatus } from "../models/users";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}
