import "reflect-metadata";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { connectDB } from "./utils/db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to DB
connectDB();

// Middleware (parse JSON)
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from SmartScholar backend (TypeScript)!");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
