import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { Scholarship } from "../models/scholarships";
import { StudentProfile } from "../models/student_profiles";
import { User, UserRole, UserStatus } from "../models/users";
import { ProviderProfile } from "../models/provider_profiles";

export class AdminController {
  /** Get all scholarships */
  static async getAllScholarships(req: Request, res: Response): Promise<void> {
    try {
      const scholarshipRepo = AppDataSource.getRepository(Scholarship);
      const scholarships = await scholarshipRepo.find({
        relations: ["provider"],
        order: { scholarship_id: "DESC" },
        // where: { status: "approved" },
      });

      res.json({
        success: true,
        data: scholarships,
        count: scholarships.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to fetch scholarships" });
      }
    }
  }

  // Getting PendingScholarship
  static async getPendingScholarships(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const scholarshipRepo = AppDataSource.getRepository(Scholarship);

      const pendingScholarships = await scholarshipRepo.find({
        where: { status: "pending" },
        relations: ["provider"],
      });

      res.json({
        success: true,
        count: pendingScholarships.length,
        data: pendingScholarships,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending scholarships",
        error: error.message,
      });
    }
  }

  // STUDENTS
  /** Get total number of students   tested */
  static async getTotalStudents(req: Request, res: Response): Promise<void> {
    try {
      const userRepo = AppDataSource.getRepository(User);

      const total = await userRepo.count({
        where: { role: UserRole.STUDENT },
      });

      res.json({
        success: true,
        data: { total },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get total students" });
    }
  }

  // GET /api/admin/students - Get all students
  static async getAllStudents(req: Request, res: Response): Promise<void> {
    try {
      const studentRepo = AppDataSource.getRepository(User);

      const students = await studentRepo.find({
        where: { role: UserRole.STUDENT },
        relations: ["applications", "profile"],
        order: { createdAt: "DESC" },
      });

      const data = students.map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,

        status: u.status,
        registrationDate: u.createdAt,
        lastLogin: u.updatedAt,

        country: u.profile?.country ?? "—",
        academic_level: u.profile?.academic_level ?? "—",
        field_of_study: u.profile?.field_of_study ?? "—",
        applicationsCount: u.applications?.length ?? 0,
        acceptedScholarships:
          u.applications?.filter((a) => a.status === "accepted").length ?? 0,
      }));

      res.json({
        success: true,
        data: students,
        count: students.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch students",
        error: error.message,
      });
    }
  }

  //Student by id
  static getStudentProfileById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const profileRepo = AppDataSource.getRepository(StudentProfile);

      const profile = await profileRepo.findOne({
        where: { student_id: parseInt(id) },
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
  // PATCH /api/admin/students/:id/suspend
  static async suspendStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = Number(req.params.id);

      const userRepo = AppDataSource.getRepository(User);

      const student = await userRepo.findOne({
        where: { id: studentId, role: UserRole.STUDENT },
      });

      if (!student) {
        res.status(404).json({ success: false, message: "Student not found" });
        return;
      }

      student.status = UserStatus.SUSPENDED;
      await userRepo.save(student);

      res.json({
        success: true,
        message: "Student suspended successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to suspend student" });
    }
  }
  // DELETE /api/admin/students/:id
  static async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = Number(req.params.id);
      const userRepo = AppDataSource.getRepository(User);

      const student = await userRepo.findOne({
        where: { id: studentId, role: UserRole.STUDENT },
      });

      if (!student) {
        res.status(404).json({ success: false, message: "Student not found" });
        return;
      }

      await userRepo.remove(student);

      res.json({
        success: true,
        message: "Student deleted successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to delete student" });
    }
  }

  // PATCH /api/admin/students/:id/activate
  static async activateStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = Number(req.params.id);
      const userRepo = AppDataSource.getRepository(User);

      const student = await userRepo.findOne({
        where: { id: studentId, role: UserRole.STUDENT },
      });

      if (!student) {
        res.status(404).json({ success: false, message: "Student not found" });
        return;
      }

      student.status = UserStatus.ACTIVE;
      await userRepo.save(student);

      res.json({
        success: true,
        message: "Student activated successfully",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to activate student" });
    }
  }

  //PROVIDERS
  //Getting providers
  static async getProviders(req: Request, res: Response): Promise<void> {
    try {
      const userRepo = AppDataSource.getRepository(User);

      const providers = await userRepo.find({
        where: {
          role: UserRole.PROVIDER, // ✅ NO status filter
        },
        relations: ["providerProfile"], // optional
        order: { createdAt: "DESC" },
      });

      res.json({
        success: true,
        data: providers,
        count: providers.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch providers",
        error: error.message,
      });
    }
  }

  //Get pending Providers
  static async getPendingProviders(req: Request, res: Response): Promise<void> {
    try {
      const userRepo = AppDataSource.getRepository(User);

      const pendingProviders = await userRepo.find({
        where: {
          status: UserStatus.PENDING,
          role: UserRole.PROVIDER,
        },
        order: { createdAt: "DESC" },
      });
      res.json({
        success: true,
        count: pendingProviders.length,
        data: pendingProviders,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch pending providers",
        error: error.message,
      });
    }
  }

  // ================= PROVIDER ACTIONS =================
  //approve
  static async approveProvider(req: Request, res: Response): Promise<void> {
    try {
      const providerId = Number(req.params.id);

      const userRepo = AppDataSource.getRepository(User);
      const profileRepo = AppDataSource.getRepository(ProviderProfile);

      const provider = await userRepo.findOne({
        where: { id: providerId, role: UserRole.PROVIDER },
        relations: ["providerProfile"],
      });

      if (!provider) {
        res.status(404).json({ success: false, message: "Provider not found" });
        return;
      }

      provider.status = UserStatus.ACTIVE;
      await userRepo.save(provider);

      if (provider.providerProfile) {
        provider.providerProfile.verified = true;
        await profileRepo.save(provider.providerProfile);
      }

      res.json({
        success: true,
        message: "Provider approved successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to approve provider",
        error: error.message,
      });
    }
  }
  //reject
  static async rejectProvider(req: Request, res: Response): Promise<void> {
    try {
      const providerId = Number(req.params.id);

      const userRepo = AppDataSource.getRepository(User);

      const provider = await userRepo.findOne({
        where: { id: providerId, role: UserRole.PROVIDER },
      });

      if (!provider) {
        res.status(404).json({ success: false, message: "Provider not found" });
        return;
      }

      provider.status = UserStatus.SUSPENDED;
      await userRepo.save(provider);

      res.json({
        success: true,
        message: "Provider rejected",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to reject provider",
        error: error.message,
      });
    }
  }
  //suspend
  static async suspendProvider(req: Request, res: Response): Promise<void> {
    try {
      const providerId = Number(req.params.id);

      const userRepo = AppDataSource.getRepository(User);

      const provider = await userRepo.findOne({
        where: { id: providerId, role: UserRole.PROVIDER },
      });

      if (!provider) {
        res.status(404).json({ success: false, message: "Provider not found" });
        return;
      }

      provider.status = UserStatus.SUSPENDED;
      await userRepo.save(provider);

      res.json({
        success: true,
        message: "Provider suspended",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to suspend provider",
        error: error.message,
      });
    }
  }
  //activate
  static async activateProvider(req: Request, res: Response): Promise<void> {
    try {
      const providerId = Number(req.params.id);

      const userRepo = AppDataSource.getRepository(User);

      const provider = await userRepo.findOne({
        where: { id: providerId, role: UserRole.PROVIDER },
      });

      if (!provider) {
        res.status(404).json({ success: false, message: "Provider not found" });
        return;
      }

      provider.status = UserStatus.ACTIVE;
      await userRepo.save(provider);

      res.json({
        success: true,
        message: "Provider activated",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to activate provider",
        error: error.message,
      });
    }
  }

  static async deleteProvider(req: Request, res: Response): Promise<void> {
    try {
      const providerId = Number(req.params.id);
      const userRepo = AppDataSource.getRepository(User);

      // Only delete users with provider role
      const provider = await userRepo.findOne({
        where: { id: providerId, role: UserRole.PROVIDER },
      });

      if (!provider) {
        res.status(404).json({ success: false, message: "Provider not found" });
        return;
      }

      await userRepo.remove(provider);

      res.json({
        success: true,
        message: "Provider deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Failed to delete provider",
      });
    }
  }
}
