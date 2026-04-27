import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load env from repo root and backend/ (dotenv does not override existing keys)
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

import { createDb } from "./db.js";
import { createAuthRouter } from "./routes/auth.js";
import { createDirectorUsersRouter } from "./routes/directorUsers.js";
import { createContentRouter } from "./routes/content.js";
import { createPayrollRouter } from "./routes/payroll.js";
import { createFeesRouter } from "./routes/fees.js";
import { startScheduler } from "./services/scheduler.js";

const port = Number(process.env.PORT || 4000);
const jwtSecret =
  process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? "" : "dev-jwt-secret");
if (!jwtSecret) throw new Error("JWT_SECRET is required");

const db = createDb({ dbPath: process.env.DB_PATH });

const app = express();

// Ensure MongoDB is ready before API handlers (Vercel cold starts + local reconnects)
app.use(async (req, res, next) => {
  if (!req.path.startsWith("/api")) {
    next();
    return;
  }
  try {
    await db.connect();
    next();
  } catch (e) {
    console.error("DB Connect error:", e);
    res.status(500).json({ error: `Database connection failed: ${e.message}` });
  }
});

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", createAuthRouter({ db, jwtSecret }));
app.use("/api/director/users", createDirectorUsersRouter({ db, jwtSecret }));
app.use("/api/content", createContentRouter({ db, jwtSecret }));
app.use("/api/payroll", createPayrollRouter({ db, jwtSecret }));
app.use("/api/fees", createFeesRouter({ db, jwtSecret }));
// Serve static files from the frontend dist directory
const distPath = path.join(__dirname, "../../dist");
app.use(express.static(distPath));

// Client-side routing (do not send SPA HTML for unknown /api routes — breaks JSON clients)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "API route not found" });
    return;
  }
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

// For Vercel, we export the app
export default app;

// Only start the server if we are running it directly (not imported)
if (!process.env.VERCEL && process.env.VITE_VERCEL !== '1') {
  // Connect to DB before listening
  db.connect()
    .then(() => {
      startScheduler(db);
      app.listen(port, () => {
        process.stdout.write(`Backend listening on http://localhost:${port}\n`);
      });
    })
    .catch((err) => {
      console.error("Failed to connect to DB:", err);
      process.exit(1);
    });
}
