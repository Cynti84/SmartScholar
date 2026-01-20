import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import {
  authenticateAdmin,
  adminRateLimiter,
} from "../middleware/admin.Middleware";
import { AdminScholarship } from "../controllers/adminScholarship";

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

//Providers
router.get("/providers", AdminController.getProviders);
router.get("/providers/pending", AdminController.getPendingProviders);

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

export default router;
