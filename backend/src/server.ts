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
import matchingRoutes from "./routes/matching.routes";

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
app.use(express.json());

// Simple Test
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from SmartScholar backend (TypeScript)!");
});

// My Routes
app.use("/api/auth", authRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/provider", providerScholarshipRoutes, scholarshipAnalyticsRoutes);
app.use("/api/student", studentRoutes, matchingRoutes);

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
