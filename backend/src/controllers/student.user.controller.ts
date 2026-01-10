import { Request, Response } from "express";
import { AuthRequest } from "../types/student.types";
import { User, UserStatus } from "../models/users";
import { StudentProfile } from "../models/student_profiles";
import { AppDataSource } from "../utils/db";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { UserRepository } from "../repositories/user.repository";
import { ILike, Repository, Brackets } from "typeorm";
import { Scholarship } from "../models/scholarships";
import { MoreThanOrEqual } from "typeorm";
import { Bookmark } from "../models/Bookmark";
import { Application } from "../models/applications";
import { DeepPartial } from "typeorm";
//CreateProfile
export const createStudentProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;
    const userId = authReq.user!.id;
    const data = req.body;

    const profileRepo = AppDataSource.getRepository(StudentProfile);

    const files = req.files as {
      profileImage?: Express.Multer.File[];
      cvFile?: Express.Multer.File[];
    };
    const profileData: DeepPartial<StudentProfile> = {
      student_id: userId,
      ...data,
      profile_image_url: files?.profileImage?.[0]?.path ?? null,
      cv_url: files?.cvFile?.[0]?.path ?? null,
    };

    const existing = await profileRepo.findOne({
      where: { student_id: userId },
    });

    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Profile already exists." });
    }

    const profile = profileRepo.create(profileData);

    await profileRepo.save(profile);

    return res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// GetProfile test first
export const getStudentProfile = async (req: Request, res: Response) => {
  try {
    const authReq = req as unknown as AuthRequest;

    if (!authReq.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = authReq.user.id;
    const profileRepo = AppDataSource.getRepository(StudentProfile);

    const profile = await profileRepo.findOne({
      where: { student_id: userId },
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get student profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student profile",
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
    const profileRepo = AppDataSource.getRepository(StudentProfile);

    const profile = await profileRepo.findOne({
      where: { student_id: userId },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found." });
    }

    const files = req.files as {
      profileImage?: Express.Multer.File[];
      cvFile?: Express.Multer.File[];
    };

    const updatedData: Partial<StudentProfile> = {
      ...req.body,
    };

    if (files?.profileImage?.[0]) {
      updatedData.profile_image_url = files.profileImage[0].path;
    }

    if (files?.cvFile?.[0]) {
      updatedData.cv_url = files.cvFile[0].path;
    }

    if (req.body.financial_need !== undefined) {
      updatedData.financial_need = req.body.financial_need === "true";
    }

    profileRepo.merge(profile, updatedData);
    const updated = await profileRepo.save(profile);

    return res.status(200).json({
      success: true,
      data: updated,
    });
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
    const authReq = req as unknown as AuthRequest;
    const userId = authReq.user!.id;
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

// scholarship for student
//getting all scholarship
export const getScholarshipsForStudent = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";
    const sort = (req.query.sort as string) || "DESC";

    const scholarshipRepo: Repository<Scholarship> =
      AppDataSource.getRepository(Scholarship);

    const where: any = {};

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    const [scholarships, total] = await scholarshipRepo.findAndCount({
      where,
      order: { scholarship_id: sort === "ASC" ? "ASC" : "DESC" },
      skip: (page - 1) * limit,
      take: limit,
      relations: ["provider"],
    });

    return res.status(200).json({
      success: true,
      data: scholarships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching scholarships",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// getting scholarship by id
export const getScholarshipById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scholarship ID",
      });
    }

    const scholarshipRepo = AppDataSource.getRepository(Scholarship);

    const scholarship = await scholarshipRepo.findOne({
      where: { scholarship_id: id },
      relations: ["provider", "applications"],
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    res.status(200).json({
      success: true,
      data: scholarship,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching scholarship",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Getting active scholarship
export const getActiveScholarships = async (req: Request, res: Response) => {
  try {
    const scholarshipRepo = AppDataSource.getRepository(Scholarship);

    // Example 1: If you have an 'isActive' boolean column
    const activeScholarships = await scholarshipRepo.find({
      where: {
        status: "open",
        // deadline: MoreThanOrEqual(new Date()),
      },
      relations: ["provider", "applications"],
    });

    // Example 2: If active means current date is between startDate and endDate

    // const now = new Date();
    // const activeScholarships = await scholarshipRepo.find({
    //   where: {
    //     startDate: LessThanOrEqual(now),
    //     endDate: MoreThanOrEqual(now)
    //   },
    //   relations: ["provider", "applications"],
    // });

    res.status(200).json({
      success: true,
      data: activeScholarships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching active scholarships",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//bookmarkScholarship
export const bookmarkScholarship = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    const userId = user?.id;

    const scholarshipId = Number(req.params.scholarshipId);
    if (isNaN(scholarshipId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scholarship ID",
      });
    }

    const scholarshipRepo = AppDataSource.getRepository(Scholarship);
    const bookmarkRepo = AppDataSource.getRepository(Bookmark);

    // Check if scholarship exists
    const scholarship = await scholarshipRepo.findOne({
      where: { scholarship_id: scholarshipId },
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: "Scholarship not found",
      });
    }

    // Check if already bookmarked
    const existing = await bookmarkRepo.findOne({
      where: {
        userId,
        scholarshipId,
        status: "bookmarked",
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Scholarship already bookmarked",
      });
    }

    // Create bookmark entity
    const bookmark = bookmarkRepo.create({
      userId,
      scholarshipId,
      status: "bookmarked",
      bookmarkedAt: new Date(),
    });

    await bookmarkRepo.save(bookmark);

    return res.status(201).json({
      success: true,
      message: "Scholarship bookmarked successfully",
      data: bookmark,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error bookmarking scholarship",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//Get bookmarkScholarship
export const getBookmarkedScholarships = async (
  req: Request,
  res: Response
) => {
  try {
    // Get user from request (after authentication middleware)
    const user: any = (req as any).user;
    const userId = user?.id;

    const bookmarkRepo = AppDataSource.getRepository(Bookmark);

    // Find all bookmarks for this user where status is "bookmarked"
    const bookmarked = await bookmarkRepo.find({
      where: {
        userId,
        status: "bookmarked",
      },
      relations: ["scholarship"], // Populate the scholarship data
    });

    res.status(200).json({
      success: true,
      data: bookmarked,
      count: bookmarked.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bookmarked scholarships",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//Marking scholarship as applied
export const markScholarshipAsApplied = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user?.id;
    const scholarshipId = Number(req.params.scholarshipId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (isNaN(scholarshipId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid scholarship ID" });
    }

    const applicationRepo = AppDataSource.getRepository(Application);
    const scholarshipRepo = AppDataSource.getRepository(Scholarship);

    // Check if scholarship exists
    const scholarship = await scholarshipRepo.findOneBy({
      scholarship_id: scholarshipId,
    });
    if (!scholarship) {
      return res
        .status(404)
        .json({ success: false, message: "Scholarship not found" });
    }

    // Check if application already exists for this student and scholarship
    const existingApplication = await applicationRepo.findOne({
      where: {
        scholarship: { scholarship_id: scholarshipId },
        student: { id: userId },
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "Already applied for this scholarship",
      });
    }

    // Create new application entity
    const application = applicationRepo.create({
      student: { id: userId },
      scholarship: { scholarship_id: scholarshipId },
      applied: true,
      status: "pending",
    });

    await applicationRepo.save(application);

    return res.status(201).json({
      success: true,
      message: "Scholarship marked as applied successfully",
      data: application,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark scholarship as applied",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Getting appliedScholarship
export const getAppliedScholarships = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user; // get authenticated user
    const userId = user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const applicationRepo = AppDataSource.getRepository(Application);

    // fetch applications where student = userId
    const applied = await applicationRepo.find({
      where: { student: { id: userId } },
      relations: ["scholarship"], // populate scholarship details
      order: {
        applied: "DESC", // or the correct timestamp field name
      },
    });

    res.status(200).json({
      success: true,
      data: applied.map((app) => ({
        applicationId: app.application_id,
        scholarship: app.scholarship,
        status: app.status,
      })),
      count: applied.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching applied scholarships",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//Getting TotalApplied scholarship
export const getTotalApplied = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    const userId = user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const applicationRepo = AppDataSource.getRepository(Application);

    const count = await applicationRepo.count({
      where: {
        student: { id: userId },
        applied: true, // only count applied applications
      },
    });

    return res.status(200).json({
      success: true,
      data: { total: count },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching total applied",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
//Get ExpiredApplied Scholarship
export const getExpiredApplied = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    const userId = user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const applicationRepo = AppDataSource.getRepository(Application);

    // Fetch applications where student = userId and applied = true, with scholarship details
    const applied = await applicationRepo.find({
      where: { student: { id: userId }, applied: true },
      relations: ["scholarship"],
    });

    // Filter applications where scholarship deadline is in the past
    const expired = applied.filter(
      (app) =>
        app.scholarship?.deadline && app.scholarship.deadline < new Date()
    );

    return res.status(200).json({
      success: true,
      data: expired,
      count: expired.length,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching expired scholarships",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//Removing bookmarked scholarship
export const removeBookmark = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    const userId = user?.id;

    const scholarshipId = Number(req.params.scholarshipId);
    if (isNaN(scholarshipId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scholarship ID",
      });
    }

    const bookmarkRepo = AppDataSource.getRepository(Bookmark);

    const result = await bookmarkRepo.delete({
      userId,
      scholarshipId,
      status: "bookmarked",
    });

    if (result.affected === 0) {
      return res.status(404).json({
        success: false,
        message: "Bookmark not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error removing bookmark",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

//Downloading user data#

export const downloadStudentProfile = async (req: Request, res: Response) => {
  try {
    const user: any = (req as any).user;
    const userId = user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userRepo = AppDataSource.getRepository(User);
    const student = await userRepo.findOne({
      where: { id: userId },
      relations: ["scholarships", "applications"], // include relations if needed
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Send as JSON file
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=student_profile_${userId}.json`
    );
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(JSON.stringify(student, null, 2));
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error downloading student profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// export const getStudentProfile = async (req: Request, res: Response) => {
//   try {
//     const studentId = req.user!.id;

//     const studentRepo = AppDataSource.getRepository(StudentProfile);

//     const profile = await studentRepo.findOne({
//       where: { student_id: studentId },
//     });

//     if (!profile) {
//       return res.status(404).json({
//         success: false,
//         message: "Student profile not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       data: profile,
//     });
//   } catch (error) {
//     console.error("Get student profile error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch student profile",
//     });
//   }
// };
