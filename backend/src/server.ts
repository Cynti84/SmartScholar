import "reflect-metadata";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import { connectDB, runMigrationsSafe } from "./utils/db";
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

// enable trust proxy for production
app.set("trust proxy", 1);

// Middleware (parse JSON)
app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: true }));

// Allow multiple origins for production
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:4200",
  /\.vercel\.app$/,
].filter(Boolean) as (string | RegExp)[];

//4. enable cors
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Check if origin is allowed
      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === "string") {
          return allowed === origin;
        }
        // RegExp
        return allowed.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

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

// backend/src/server.ts - temporary test endpoint

app.get("/test-email", async (req, res) => {
  try {
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: "your-test-email@gmail.com", // Replace with your email
      subject: "Test Email",
      text: "If you receive this, email is working!",
    });

    res.json({ success: true, message: "Email sent!" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// safe migration on startup
const startServer = async () => {
  await connectDB(); // Connect to DB
  await runMigrationsSafe(); // Run pending migrations safely

  const PORT = process.env.PORT || 10000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
