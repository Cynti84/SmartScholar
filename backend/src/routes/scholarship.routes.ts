import { Router } from "express";

import { getLandingScholarships } from "../controllers/scholarship.controller";
const router = Router();
router.get("/landing", getLandingScholarships);
