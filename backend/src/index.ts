import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { seedDatabase } from "./seed";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";
import studentRouter from "./routes/student";
import lecturerRouter from "./routes/lecturer";
import hostsRouter from "./routes/hosts";
import lecturersRouter from "./routes/lecturers";
import modulesRouter from "./routes/modules";
import { authenticate } from "./middleware/authenticate";
import { requireRole } from "./middleware/requireRole";

const app = express();
const PORT = process.env.PORT ?? 3000;
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://mongo:27017/overseas";

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mongoConnected: mongoose.connection.readyState === 1 });
});

app.use("/api/auth", authRouter);
app.use("/api/admin", authenticate, requireRole("admin"), adminRouter);
app.use("/api/student", authenticate, requireRole("student"), studentRouter);
app.use("/api/lecturer", authenticate, requireRole("lecturer"), lecturerRouter);
app.use("/api/hosts", authenticate, hostsRouter);
app.use("/api/lecturers", authenticate, lecturersRouter);
app.use("/api/modules", authenticate, modulesRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(400).json({ error: err.message || "Unexpected error" });
});

async function start() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");
  await seedDatabase();
  app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
}

start().catch((err) => {
  console.error("Failed to start backend", err);
  process.exit(1);
});
