import "reflect-metadata";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB } from "./utils/db";
import authRoutes from "./routes/auth.routes";
import providerRoutes from "./routes/providerProfile.routes";
import adminRoutes from "./routes/admin.routes";
import providerScholarshipRoutes from "./routes/providerScholarship.routes";
import scholarshipAnalyticsRoutes from "./routes/scholarshipAnalytics.routes";
import studentRoutes from "./routes/student.routes";
import { getLandingScholarships } from "./controllers/scholarship.controller";
import recommendationExplanationRoutes from "./routes/recommendationExplanation.routes";
import applicationReadinessRoutes from "./routes/applicationReadiness.routes";
import aiDiscoveryRoutes from "./routes/aiScholarshipDiscovery.routes";

import applicationAssistantRoutes from "./routes/applicationAssistant.routes";
import fraudDetectionRoutes from "./routes/fraud-detection.routes";
import postingAssistantRoutes from "./routes/posting-assistance.routes";

//1. configure dotenv
dotenv.config();

//2. create instance of express
const app = express();

//3. load variables
const PORT = process.env.PORT || 5000;

//4. enable cors
app.use(cors());

//5. Connect to DB
connectDB();

//6. Middleware (parse JSON)
app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: true }));

// Simple Test
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from SmartScholar backend (TypeScript)!");
});

// ✅ Health Check Endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime(),
  });
});

// My Routes
app.use("/api/auth", authRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/provider/posting-assistant", postingAssistantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/fraud-detection", fraudDetectionRoutes);
app.use("/api/provider", providerScholarshipRoutes, scholarshipAnalyticsRoutes);
// app.use("/api/student", studentRoutes);
app.use("/api/scholarships", getLandingScholarships);
app.use(
  "/api/student",
  studentRoutes,
  recommendationExplanationRoutes,
  applicationReadinessRoutes,
  aiDiscoveryRoutes
);
app.use("/api/student/application-assistant", applicationAssistantRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
