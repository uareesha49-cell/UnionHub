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
const isProd = process.env.NODE_ENV === "production";
const jwtSecret =
  process.env.JWT_SECRET || (isProd ? "" : "dev-jwt-secret");
// Do not throw at module load on Vercel — missing JWT_SECRET would crash every invocation
// before Express runs (FUNCTION_INVOCATION_FAILED). Misconfig is handled below.

const db = createDb({ dbPath: process.env.DB_PATH });

/** Pathname for routing (works when `req.path` is empty in some serverless runtimes). */
function pathname(req) {
  const raw = req.originalUrl || req.url || "";
  const p = raw.split("?")[0] || "";
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

function isApiRequest(req) {
  const p = pathname(req);
  return p === "/api" || p.startsWith("/api/");
}

const isServerlessRuntime =
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
  process.env.VITE_VERCEL === "1";

const app = express();

// Misconfigured production (no JWT) — return JSON instead of crashing the function
app.use((req, res, next) => {
  if (!isApiRequest(req)) {
    next();
    return;
  }
  if (pathname(req) === "/api/health") {
    next();
    return;
  }
  if (isProd && !process.env.JWT_SECRET) {
    res.status(503).json({
      error:
        "Server misconfigured: set JWT_SECRET in Vercel → Project → Settings → Environment Variables, then redeploy.",
    });
    return;
  }
  next();
});

// Ensure MongoDB is ready before API handlers (Vercel cold starts + local reconnects)
app.use(async (req, res, next) => {
  if (!isApiRequest(req)) {
    next();
    return;
  }
  if (pathname(req) === "/api/health") {
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
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
    credentials: true,
  })
);

app.get("/api/health", (req, res) => {
  res.json({ ok: true, serverless: isServerlessRuntime });
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
  if (isApiRequest(req)) {
    res.status(404).json({ error: "API route not found" });
    return;
  }
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) next(err);
  });
});

// For Vercel, we export the app
export default app;

// Only start the server locally — never call listen inside Vercel / Lambda
if (!isServerlessRuntime) {
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
