import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import {
  authenticateAdmin,
  adminRateLimiter,
} from "../middleware/admin.Middleware";

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

export default router;
