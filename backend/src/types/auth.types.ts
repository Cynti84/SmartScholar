export enum UserRole {
  ADMIN = "admin",
  STUDENT = "student",
  PROVIDER = "provider",
}

export enum UserStatus {
  PENDING = "pending",
  ACTIVE = "active",
  SUSPENDED = "suspended",
}

export interface IUser {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignupDTO {
  email: string;
  password: string;
  // confirmPassword: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  // Student specific
  university?: string;
  major?: string;
  // Provider specific
  organizationName?: string;
  organizationType?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
  role: UserRole;
}

export interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface JwtPayloadData {
  id: number;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: Partial<IUser>;
  };
}