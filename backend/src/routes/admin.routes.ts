import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import {
  authenticateAdmin,
  adminRateLimiter,
} from "../middleware/admin.Middleware";
import { AdminProviderController } from "../controllers/adminProvider";

import { AdminScholarship } from "../controllers/adminScholarship";
import { AdminAnalyticsController } from "../controllers/admin-analytics.controller";
import { AdminNotificationController } from "../controllers/admin-notification.controller";
import { AdminReportsController } from "../controllers/admin-reports.controller";

const router = Router();

// Apply authentication and rate limiting to all admin routes
router.use(authenticateAdmin);
router.use(adminRateLimiter);

// Scholarships
router.get("/scholarships", AdminController.getAllScholarships);
router.get("/scholarships/pending", AdminController.getPendingScholarships);

// Total students
router.get("/students/total", AdminController.getTotalStudents);

router.get("/students", AdminController.getAllStudents);
// Suspend student
router.patch("/students/:id/suspend", AdminController.suspendStudent);

// Activate student
router.patch("/students/:id/activate", AdminController.activateStudent);

// Get single student profile by ID
router.get("/students/profile/:id", AdminController.getStudentProfileById);

// Delete student (hard delete)
router.delete("/students/:id", AdminController.deleteStudent);

//Providers
router.get("/providers", AdminController.getProviders);
router.get("/providers/pending", AdminController.getPendingProviders);
router.get(
  "/providers/:id/scholarships",
  AdminProviderController.getProviderScholarships,
);
router.delete("/providers/:id", AdminController.deleteProvider);
// Provider management actions
router.patch("/providers/:id/approve", AdminController.approveProvider);
router.patch("/providers/:id/reject", AdminController.rejectProvider);
router.patch("/providers/:id/suspend", AdminController.suspendProvider);
router.patch("/providers/:id/activate", AdminController.activateProvider);

//scholarship
// Admin scholarship management
router.put("/scholarships/:id", AdminScholarship.updateScholarship);
router.delete("/scholarships/:id", AdminScholarship.deleteScholarship);
router.patch("/scholarships/:id/approve", AdminScholarship.approveScholarship);
router.patch("/scholarships/:id/reject", AdminScholarship.rejectScholarship);

//analytics
router.get(
  "/dashboard/analytics",
  AdminAnalyticsController.getDashboardAnalytics,
);
//Notifications
router.get("/notifications", AdminNotificationController.getNotifications);
router.post("/notifications", AdminNotificationController.createNotification);
//report analytics
router.get("/dashboard/reports", AdminReportsController.getDashboardData);

export default router;
