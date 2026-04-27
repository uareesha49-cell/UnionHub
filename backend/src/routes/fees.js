import express from "express";
import { requireAuth, requireRole } from "../auth.js";
import { buildVoucherHtml } from "../voucherHtml.js";

export function createFeesRouter({ db, jwtSecret }) {
  const router = express.Router();
  router.use(requireAuth({ jwtSecret }));

  router.get("/my", requireRole(["student"]), async (req, res) => {
    const user = await db.getUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const fees = await db.listFeesForStudent(req.user.id);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        role: user.role,
        created_at: user.created_at ?? null,
      },
      fees,
    });
  });

  router.get("/students", requireRole(["finance"]), async (req, res) => {
    const students = await db.listStudentUsersForFees();
    res.json({ students });
  });

  router.get("/", requireRole(["finance"]), async (req, res) => {
    const fees = await db.listFeesForFinance();
    res.json({ fees });
  });

  router.post("/", requireRole(["finance"]), async (req, res) => {
    const body = req.body || {};
    const student_user_id = body.student_user_id ?? body.studentUserId;
    const fee_title = body.fee_title ?? body.title;
    const { amount, notes } = body;
    try {
      const fee = await db.createFee({
        student_user_id,
        fee_title,
        amount,
        notes,
        created_by: req.user.id,
      });
      res.status(201).json({ fee });
    } catch (e) {
      if (e?.code === "STUDENT_NOT_FOUND") {
        res.status(400).json({ error: "Student not found" });
        return;
      }
      if (e?.code === "INVALID_AMOUNT" || e?.code === "INVALID_TITLE" || e?.code === "INVALID_STUDENT") {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error(e);
      res.status(500).json({ error: "Could not create fee" });
    }
  });

  router.get("/:feeId/voucher", async (req, res) => {
    const feeId = Number(req.params.feeId);
    if (!Number.isFinite(feeId)) {
      res.status(400).json({ error: "Invalid fee id" });
      return;
    }
    const fee = await db.getFeeById(feeId);
    if (!fee) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const role = req.user.role;
    if (role === "student" && Number(fee.student_user_id) !== Number(req.user.id)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (role !== "student" && role !== "finance") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const student = await db.getUserById(fee.student_user_id);
    const issuer = await db.getUserById(fee.created_by);
    const studentName = student?.name || null;
    const studentEmail = student?.email || null;
    const issuerEmail = issuer?.email || null;

    const html = buildVoucherHtml({ fee, studentName, studentEmail, issuerEmail });
    const filename = `voucher-${fee.voucher_code}.html`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(html);
  });

  return router;
}
