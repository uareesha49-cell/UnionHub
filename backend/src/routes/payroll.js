import express from "express";
import { requireAuth, requireRole } from "../auth.js";

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeLineItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((row) => ({
      label: String(row?.label ?? "").trim() || "Item",
      amount: Math.max(0, num(row?.amount, 0)),
    }))
    .filter((row) => row.amount > 0 || row.label !== "Item");
}

function isValidPeriodKey(key) {
  if (key === "legacy") return true;
  return /^\d{4}-\d{2}$/.test(key);
}

export function createPayrollRouter({ db, jwtSecret }) {
  const router = express.Router();
  router.use(requireAuth({ jwtSecret }));

  router.get("/me", async (req, res) => {
    const rows = await db.listPayrollsForUser(req.user.id);
    const items = rows.map((payroll) => ({
      payroll,
      summary: db.computePayrollSummary(payroll),
    }));
    const latest = rows[0] || null;
    res.json({
      items,
      payroll: latest,
      summary: db.computePayrollSummary(latest),
    });
  });

  router.get("/manage/:userId", requireRole(["finance"]), async (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }
    const target = await db.getUserById(userId);
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (target.role === "finance") {
      res.status(403).json({ error: "Cannot manage payroll for finance accounts" });
      return;
    }
    const rows = await db.listPayrollsForUser(userId);
    const periods = rows.map((payroll) => ({
      payroll,
      summary: db.computePayrollSummary(payroll),
    }));
    res.json({ user: { id: target.id, email: target.email, role: target.role }, periods });
  });

  router.get("/", requireRole(["finance"]), async (_req, res) => {
    const data = await db.listPayrollWithUsers();
    res.json(data);
  });

  router.put("/:userId", requireRole(["finance"]), async (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId)) {
      res.status(400).json({ error: "Invalid user id" });
      return;
    }

    const target = await db.getUserById(userId);
    if (!target) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (target.role === "finance") {
      res.status(403).json({ error: "Cannot manage payroll for finance accounts" });
      return;
    }

    const body = req.body || {};
    const period_key = String(body.period_key ?? "").trim();
    if (!isValidPeriodKey(period_key)) {
      res.status(400).json({
        error: "Choose a payroll month (period_key as YYYY-MM). Use \"legacy\" only for migrated rows.",
      });
      return;
    }

    const base_salary = Math.max(0, num(body.base_salary, 0));
    const period = body.period != null ? String(body.period).trim() : "";
    const bonuses = sanitizeLineItems(body.bonuses);
    const deductions = sanitizeLineItems(body.deductions);
    const fines_cuts = sanitizeLineItems(body.fines_cuts);

    const saved = await db.upsertPayroll({
      user_id: userId,
      period_key,
      period: period || null,
      base_salary,
      bonuses,
      deductions,
      fines_cuts,
      updated_by: req.user.id,
    });
    res.json({ payroll: saved, summary: db.computePayrollSummary(saved) });
  });

  return router;
}
