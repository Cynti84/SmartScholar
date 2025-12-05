import { Request, Response } from "express";
import { AuthRequest } from "../types/student.types";
import { User, UserStatus } from "../models/users";
import { StudentProfile } from "../models/student_profiles";
import { AppDataSource } from "../utils/db";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { UserRepository } from "../repositories/user.repository";

//CreateProfile
export const createStudentProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const userId = authReq.user!.id;
    const data = req.body;

    const profileRepo = AppDataSource.getRepository(StudentProfile);

    const existing = await profileRepo.findOne({
      where: { student_id: userId },
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Profile already exists." });
    }

    const profile = profileRepo.create({
      student_id: userId,
      ...data,
    });

    await profileRepo.save(profile);

    return res.status(201).json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//UpdateProfile
export const updateStudentProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const userId = authReq.user.id;

    const data = req.body as Partial<StudentProfile>;

    const profileRepo = AppDataSource.getRepository(StudentProfile);

    const profile = await profileRepo.findOne({
      where: { student_id: userId },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found." });
    }

    const allowedFields: (keyof StudentProfile)[] = [
      "country",
      "academic_level",
      "field_of_study",
      "interest",
      "profile_image_url",
      "cv_url",
      "date_of_birth",
      "gender",
      "financial_need",
    ];

    const updatedData: Partial<StudentProfile> = {};

    allowedFields.forEach((key) => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        (updatedData as any)[key] = value;
      }
    });

    profileRepo.merge(profile, updatedData);
    const updated = await profileRepo.save(profile);

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//deleteProfile
export const deleteProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const userId = authReq.user!.id;

    const userRepo = AppDataSource.getRepository(User);
    const profileRepo = AppDataSource.getRepository(StudentProfile);

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.status = UserStatus.SUSPENDED;
    await userRepo.save(user);

    const profile = await profileRepo.findOne({
      where: { student_id: userId },
    });
    if (profile) {
      await profileRepo.remove(profile);
    }

    return res
      .status(200)
      .json({ success: true, message: "Profile deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//logout
export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Logout failed.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Optional: save token to blacklist if you want to invalidate it
    // await TokenBlacklist.create({ token });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Enable 2FA
export const enable2FA = async (req: Request, res: Response) => {
  try {
    // Cast req to AuthRequest to access user
    const authReq = req as unknown as AuthRequest;
    const userId = authReq.user!.id;

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({
      name: `ScholarshipApp (${user.email})`,
    });

    // Save secret in the user entity
    user.twoFactorSecret = secret.base32;
    await userRepo.save(user);

    // Generate QR code for scanning
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);
    const token = speakeasy.totp({
      secret: secret.base32,
      encoding: "base32",
    });

    res.status(200).json({
      success: true,
      message: "2FA secret generated",
      data: {
        secret: secret.base32,
        token,
        qrCode,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error enabling 2FA",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//Verify2FA
export const verify2FA = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const userId = authReq.user!.id;
    const { token } = req.body;

    const user = await UserRepository.findById(userId);
    if (!user || !user.twoFactorSecret) {
      return res.status(404).json({
        success: false,
        message: "User or 2FA secret not found",
      });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid 2FA token",
      });
    }

    res.status(200).json({
      success: true,
      message: "2FA enabled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error verifying 2FA",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//Disable2FA
export const disable2FA = async (req: Request, res: Response) => {
  try {
    const authReq = req as any;
    const userId = authReq.user.id;
    const { token } = req.body;

    const userRepo = AppDataSource.getRepository(User);

    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user || !user.twoFactorSecret) {
      return res.status(404).json({
        success: false,
        message: "User or 2FA secret not found",
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: "Invalid 2FA token",
      });
    }

    // Disable 2FA
    const secret = speakeasy.generateSecret().base32;
    user.twoFactorSecret = secret; // string

    await userRepo.save(user);

    return res.status(200).json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error disabling 2FA",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
