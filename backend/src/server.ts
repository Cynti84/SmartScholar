import "reflect-metadata";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { connectDB } from "./utils/db";
import authRoutes from "./routes/auth.routes";
import providerRoutes from "./routes/providerProfile.routes";
import adminRoutes from "./routes/admin.routes";
import studentRoutes from "./routes/student.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Middleware (parse JSON)
app.use(express.json());

// Routes

app.use("/api/auth", authRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from SmartScholar backend (TypeScript)!");
});

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
