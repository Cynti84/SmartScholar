import express, { Request, Response } from "express";

const app = express();
const PORT = 5000;

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express backend (TypeScript)!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
