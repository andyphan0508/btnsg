import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { ValidationError } from "./routes/crud.js";
import {
  announcementsRouter,
  attendanceRouter,
  expensesRouter,
  membersRouter,
  plansRouter,
  requestsRouter,
  scheduleRouter,
  tasksRouter,
} from "./routes/resources.js";
import { statsRouter } from "./routes/stats.js";
import { seedDatabase } from "./store/seed.js";

const PORT = Number(process.env.API_PORT) || 5080;

seedDatabase();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ data: { status: "ok", time: new Date().toISOString() } });
});

app.use("/api/members", membersRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/announcements", announcementsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/expenses", expensesRouter);
app.use("/api/plans", plansRouter);
app.use("/api/stats", statsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Không tìm thấy đường dẫn API" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
});

app.listen(PORT, () => {
  console.log(`[api] BTNSG API đang chạy tại http://localhost:${PORT}`);
});
