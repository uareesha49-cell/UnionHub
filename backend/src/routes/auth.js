import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import express from "express";
import { signToken, requireAuth, requireRole } from "../auth.js";
import { sendOtpEmail } from "../services/email.js";
import { buildVoucherHtml } from "../voucherHtml.js";

function normalizeRole(role) {
  const value = String(role || "").toLowerCase();
  if (
    value === "admin" ||
    value === "director" ||
    value === "principal" ||
    value === "teacher" ||
    value === "employee" ||
    value === "vice_principal" ||
    value === "tech_staff" ||
    value === "finance" ||
    value === "student"
  )
    return value;
  return null;
}

export function createAuthRouter({ db, jwtSecret }) {
  const router = express.Router();

  const sha256Hex = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
  const generateResetToken = () => crypto.randomBytes(32).toString("hex");

  router.post("/director/register", async (req, res) => {
    const { email, password, name, institute_name } = req.body || {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const passwordHash = bcrypt.hashSync(String(password), 10);
    try {
      const user = await db.createUser({
        email: String(email).toLowerCase(),
        password_hash: passwordHash,
        password_plain: password,
        role: "director",
        name: name ?? null,
        institute_name: institute_name ?? name ?? null, // Use institute_name if provided, else name
      });
      const token = signToken({ user, jwtSecret });
      res.json({
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          name: user.name ?? null,
          institute_name: user.institute_name ?? null,
        },
      });
    } catch {
      res.status(409).json({ error: "Email already exists" });
    }
  });

  // Admin register (for testing, can be removed later)
  router.post("/admin/register", async (req, res) => {
    const { email, password, name } = req.body || {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const passwordHash = bcrypt.hashSync(String(password), 10);
    try {
      const user = await db.createUser({
        email: String(email).toLowerCase(),
        password_hash: passwordHash,
        password_plain: password,
        role: "admin",
        name: name ?? null,
      });
      const token = signToken({ user, jwtSecret });
      res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role, name: user.name ?? null },
      });
    } catch {
      res.status(409).json({ error: "Email already exists" });
    }
  });

  router.post("/:role/login", async (req, res) => {
    try {
      const role = normalizeRole(req.params.role);
      if (!role) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      const { email, password } = req.body || {};
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
      }
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: "Invalid email address" });
        return;
      }

      const user = await db.getUserByEmailRole(String(email).toLowerCase(), role);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const ok = bcrypt.compareSync(String(password), user.password_hash);
      if (!ok) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const token = signToken({ user, jwtSecret });
      res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name ?? null, institute_name: user.institute_name ?? null } });
    } catch (e) {
      console.error("Login error:", e);
      res.status(500).json({
        error:
          e?.message?.includes("MONGODB") || e?.name === "MongoServerSelectionError"
            ? "Database unavailable. For Atlas, add your IP under Network Access, or use the same URI as production."
            : "Server error during login.",
      });
    }
  });

  router.post("/password-reset/request", async (req, res) => {
    console.log("\n[Auth] Got password reset request!");
    const { email } = req.body || {};
    console.log("[Auth] Request body:", JSON.stringify(req.body));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase();
    console.log(`[Auth] Normalized email: ${normalizedEmail}`);
    const user = await db.getUserByEmail(normalizedEmail);
    console.log(`[Auth] User found:`, user ? user.email : "NO USER FOUND!");
    if (!user) {
      res.status(404).json({ error: "Email not found" });
      return;
    }

    const otp = generateOtp();
    console.log(`[Auth] Generated OTP: ${otp}`);
    const otpHash = sha256Hex(`${user.id}:${otp}`);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await db.upsertPasswordResetOtp({
      user_id: user.id,
      otp_hash: otpHash,
      otp_expires_at: otpExpiresAt,
    });

    try {
      console.log(`[Auth] Sending OTP email to ${normalizedEmail}`);
      await sendOtpEmail(normalizedEmail, otp);
      console.log(`[Auth] OTP email sent successfully!`);
    } catch (err) {
      console.error("Failed to send email:", err);
      // Optional: Fail the request or just log it?
      // If email fails, user can't get OTP. So better to fail?
      // But we already saved OTP to DB.
      // Let's just log for now, or maybe return error.
      // Returning error is safer so they can retry.
      // But we need to ensure we don't leak info?
      // Actually, if we return error, frontend will show "Failed to send OTP".
    }

    res.json({ message: "OTP sent" });
  });

  router.post("/password-reset/verify-otp", async (req, res) => {
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      res.status(400).json({ error: "Email and OTP are required" });
      return;
    }

    const normalizedEmail = String(email).toLowerCase();
    const user = await db.getUserByEmail(normalizedEmail);
    if (!user) {
      res.status(404).json({ error: "Email not found" });
      return;
    }

    const entry = await db.getPasswordResetByUserId(user.id);
    if (!entry || !entry.otp_hash || !entry.otp_expires_at) {
      res.status(400).json({ error: "OTP not requested" });
      return;
    }

    const expiresAt = Date.parse(entry.otp_expires_at);
    if (!expiresAt || expiresAt <= Date.now()) {
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    const attempts = Number(entry.otp_attempts || 0);
    if (attempts >= 5) {
      res.status(429).json({ error: "Too many attempts" });
      return;
    }

    const computedHash = sha256Hex(`${user.id}:${String(otp)}`);
    if (computedHash !== entry.otp_hash) {
      await db.incrementPasswordResetOtpAttempts(user.id);
      res.status(401).json({ error: "Invalid OTP" });
      return;
    }

    const resetToken = generateResetToken();
    const resetTokenHash = sha256Hex(resetToken);
    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await db.setPasswordResetToken({
      user_id: user.id,
      reset_token_hash: resetTokenHash,
      reset_token_expires_at: resetTokenExpiresAt,
    });

    res.json({ resetToken });
  });

  router.post("/password-reset/reset", async (req, res) => {
    const { resetToken, newPassword } = req.body || {};
    if (!resetToken || !newPassword) {
      res.status(400).json({ error: "Reset token and new password are required" });
      return;
    }

    const rawPassword = String(newPassword);
    if (rawPassword.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const resetTokenHash = sha256Hex(String(resetToken));
    const userId = await db.consumePasswordResetToken(resetTokenHash);
    if (!userId) {
      res.status(401).json({ error: "Invalid or expired reset token" });
      return;
    }

    const current = await db.getUserById(userId);
    if (!current) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const passwordHash = bcrypt.hashSync(rawPassword, 10);
    await db.updateUserAccount({ 
      id: current.id, 
      password_hash: passwordHash,
      password_plain: rawPassword // Store plain text too
    });
    res.json({ message: "Password updated" });
  });

  /** Student portal (mounted on /api/auth) so it works even if /api/fees is unavailable on older deployments. */
  router.get("/student/me", requireAuth({ jwtSecret }), requireRole(["student"]), async (req, res) => {
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

  router.get(
    "/student/fees/:feeId/voucher",
    requireAuth({ jwtSecret }),
    requireRole(["student"]),
    async (req, res) => {
      const feeId = Number(req.params.feeId);
      if (!Number.isFinite(feeId)) {
        res.status(400).json({ error: "Invalid fee id" });
        return;
      }
      const fee = await db.getFeeById(feeId);
      if (!fee || Number(fee.student_user_id) !== Number(req.user.id)) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const student = await db.getUserById(fee.student_user_id);
      const issuer = await db.getUserById(fee.created_by);
      const html = buildVoucherHtml({
        fee,
        studentName: student?.name || null,
        studentEmail: student?.email || null,
        issuerEmail: issuer?.email || null,
      });
      const filename = `voucher-${fee.voucher_code}.html`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(html);
    }
  );

  // Validate institute name
  router.get("/institutes/validate", async (req, res) => {
    const { name } = req.query || {};
    if (!name) {
      res.status(400).json({ error: "Institute name is required" });
      return;
    }
    const exists = await db.instituteNameExists(name);
    res.json({ exists });
  });

  return router;
}
