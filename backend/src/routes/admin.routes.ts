import { Router } from "express";
import { AdminController } from "../controllers/adminController";

const router = Router();

// Scholarships
router.get("/scholarships", AdminController.getAllScholarships);

// Total students
router.get("/students/total", AdminController.getTotalStudents);

export default router;
