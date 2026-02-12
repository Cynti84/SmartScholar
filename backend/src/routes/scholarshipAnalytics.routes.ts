import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.middleware";
import {
  getScholarshipApplications,
  getScholarshipApplicationCount,
  getScholarshipDeadline,
  getDashboardSummary,
  getApplicantsByEducationLevel,
  getApplicantsByField,
  getApplicantsByCountry,
  getScholarshipOverview,
  getTotalApplicationsCount,
  getSoonestScholarshipDeadline,
} from "../controllers/scholarshipAnalytics.controller";

import { UserRepository } from "../repositories/user.repository";
import { UserRole, UserStatus } from "../models/users";

const router = Router();

// get all applicants
router.get(
  "/scholarships/:id/applications",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipApplications
);

// get number of applicants
router.get(
  "/scholarships/:id/applications/count",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipApplicationCount
);

// get scholarship deadline
router.get(
  "/scholarships/:id/deadline",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getScholarshipDeadline
);

// get provider dashboard summary
router.get(
  "/dashboard/summary",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getDashboardSummary
);

// get applicants by education level
router.get(
  "/applicants/education-level",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getApplicantsByEducationLevel
);

// get applicants by field
router.get(
  "/applicants/field",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getApplicantsByField
);

// get applicants by country
router.get(
  "/applicants/country",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getApplicantsByCountry
);

router.get(
  "/applications/count",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getTotalApplicationsCount
);

router.get(
  "/scholarships/deadline/soonest",
  AuthMiddleware.authenticate,
  AuthMiddleware.isProvider,
  getSoonestScholarshipDeadline
);

router.get("/seed-admin", async (req, res) => {
  const secret = req.query.secret;

  if (secret !== "your-secret-key-here") {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const hashedPassword =
      "$2b$12$KxwdTzJ4ImMQgUFlNbD1WeCV4numyRSoCms953Pcwo0sn8q6XrEzC";

    const admin = await UserRepository.create({
      firstName: "Admin",
      lastName: "SmartScholar",
      email: "admin@smartscholar.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      isEmailVerified: true,
      status: UserStatus.ACTIVE,
    });

    return res.json({ message: "Admin created successfully", id: admin.id });
  } catch (error) {
    return res.status(500).json({ message: "Error creating admin", error });
  }
});

export default router;
