import bcrypt from "bcryptjs";
import express from "express";
import { requireAuth, requireRole } from "../auth.js";
import { signToken } from "../auth.js";
import { ASSIGNABLE_STAFF_ROLES, normalizeAssignableRole } from "../staffRoles.js";

function normalizeRole(role) {
  return normalizeAssignableRole(role);
}

export function createDirectorUsersRouter({ db, jwtSecret }) {
  const router = express.Router();
  router.use(requireAuth({ jwtSecret }));

  const canCreateRole = (actorRole, targetRole) => {
    if (actorRole === "director")
      return (
        targetRole === "principal" ||
        targetRole === "teacher" ||
        targetRole === "employee" ||
        targetRole === "vice_principal" ||
        targetRole === "tech_staff" ||
        targetRole === "finance"
      );
    if (actorRole === "principal")
      return (
        targetRole === "teacher" ||
        targetRole === "vice_principal" ||
        targetRole === "tech_staff" ||
        targetRole === "finance"
      );
    if (actorRole === "vice_principal") return targetRole === "finance";
    return false;
  };

  const canManageRole = (actorRole, targetRole) => {
    if (actorRole === "director")
      return (
        targetRole === "principal" ||
        targetRole === "teacher" ||
        targetRole === "employee" ||
        targetRole === "vice_principal" ||
        targetRole === "tech_staff" ||
        targetRole === "finance"
      );
    if (actorRole === "principal")
      return (
        targetRole === "teacher" ||
        targetRole === "vice_principal" ||
        targetRole === "tech_staff" ||
        targetRole === "finance"
      );
    if (actorRole === "vice_principal") return targetRole === "finance";
    return false;
  };

  router.get("/", requireRole(["director", "principal", "vice_principal"]), async (req, res) => {
    const currentUser = await db.getUserById(req.user.id);
    const institute_name = currentUser?.institute_name ?? null;
    const allUsers = await db.listUsersForManagement(req.user.role);
    // Filter by institute (admin sees all)
    const users = req.user.role === "admin" ? allUsers : allUsers.filter(u => u.institute_name === institute_name);
    res.json({ users });
  });

  router.post("/", requireRole(["director", "principal", "vice_principal"]), async (req, res) => {
    const body = req.body || {};
    const email = String(body.email ?? body.Email ?? "")
      .trim()
      .toLowerCase();
    const password = body.password ?? body.Password;
    const roleRaw = body.role ?? body.Role ?? body.userRole;
    const normalizedRole = normalizeRole(roleRaw);
    const { name, institute_name } = body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || password === undefined || password === null || String(password).length === 0) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }
    if (!normalizedRole) {
      res.status(400).json({
        error: "Invalid or missing role.",
        allowedRoles: ASSIGNABLE_STAFF_ROLES,
        received: roleRaw === undefined || roleRaw === null ? null : String(roleRaw),
      });
      return;
    }

    if (!canCreateRole(req.user.role, normalizedRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    // Get the creator's institute name to use for the new user (if not provided)
    const creator = await db.getUserById(req.user.id);
    const finalInstituteName = institute_name ?? creator?.institute_name ?? null;

    const passwordHash = bcrypt.hashSync(String(password), 10);
    try {
      const user = await db.createUser({
        email: String(email).toLowerCase(),
        password_hash: passwordHash,
        password_plain: String(password),
        role: normalizedRole,
        created_by: req.user.id,
        name: name ?? null,
        institute_name: finalInstituteName,
      });
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name ?? null,
          institute_name: user.institute_name ?? null,
          created_by: user.created_by,
        },
      });
    } catch (e) {
      res.status(409).json({ error: "Email already exists" });
    }
  });

  /** Student accounts (same router as staff user APIs — avoids missing /api/students on some deployments). */
  router.get("/students", requireRole(["director", "principal", "vice_principal"]), async (req, res) => {
    const currentUser = await db.getUserById(req.user.id);
    const institute_name = currentUser?.institute_name ?? null;
    const allStudents = await db.listStudentsForManagement();
    // Filter by institute (admin sees all)
    const students = req.user.role === "admin" ? allStudents : allStudents.filter(u => u.institute_name === institute_name);
    res.json({ students });
  });

  router.post("/students", requireRole(["director", "principal"]), async (req, res) => {
    const body = req.body || {};
    const email = String(body.email ?? body.Email ?? "")
      .trim()
      .toLowerCase();
    const password = body.password ?? body.Password;
    const name = body.name !== undefined ? body.name : body.Name;
    const { institute_name } = body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || password === undefined || password === null || String(password).length === 0) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    // Get the creator's institute name to use for the new student (if not provided)
    const creator = await db.getUserById(req.user.id);
    const finalInstituteName = institute_name ?? creator?.institute_name ?? null;

    const passwordHash = bcrypt.hashSync(String(password), 10);
    try {
      const user = await db.createUser({
        email,
        password_hash: passwordHash,
        password_plain: String(password),
        role: "student",
        created_by: req.user.id,
        name: name != null && String(name).trim() ? String(name).trim() : null,
        institute_name: finalInstituteName,
      });
      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name ?? null,
          institute_name: user.institute_name ?? null,
          created_by: user.created_by,
        },
      });
    } catch (e) {
      if (e?.code === "EMAIL_EXISTS") {
        res.status(409).json({ error: "Email already exists" });
        return;
      }
      console.error(e);
      res.status(500).json({ error: "Could not create student" });
    }
  });

  router.put("/students/:id", requireRole(["director", "principal"]), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    
    const currentUser = await db.getUserById(req.user.id);
    const institute_name = currentUser?.institute_name ?? null;
    
    const current = await db.getUserById(id);
    if (!current || current.role !== "student") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    
    // Check if student is in same institute (unless admin)
    if (req.user.role !== "admin" && current.institute_name !== institute_name) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const body = req.body || {};
    const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : undefined;
    const { password, name, institute_name: newInstituteName } = body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== undefined && !emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }

    if (email === undefined && password === undefined && name === undefined && newInstituteName === undefined) {
      res.status(400).json({ error: "No changes provided" });
      return;
    }

    let nextPasswordHash = undefined;
    if (password !== undefined) {
      const raw = String(password);
      if (raw) nextPasswordHash = bcrypt.hashSync(raw, 10);
    }

    try {
      const updated = await db.updateAssignedUser({
        id,
        email,
        password_hash: nextPasswordHash,
        password_plain: password ? String(password) : undefined,
        name,
        institute_name: newInstituteName,
      });
      if (!updated) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ user: updated });
    } catch (e) {
      if (e?.code === "EMAIL_EXISTS") {
        res.status(409).json({ error: "Email already exists" });
        return;
      }
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  router.delete("/students/:id", requireRole(["director", "principal"]), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    
    const currentUser = await db.getUserById(req.user.id);
    const institute_name = currentUser?.institute_name ?? null;
    
    const current = await db.getUserById(id);
    if (!current || current.role !== "student") {
      res.status(404).json({ error: "Not found" });
      return;
    }
    
    // Check if student is in same institute (unless admin)
    if (req.user.role !== "admin" && current.institute_name !== institute_name) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    
    const ok = await db.deleteUserById(id);
    if (!ok) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
  });

  router.get("/complaint-recipients", async (req, res) => {
    const currentUser = await db.getUserById(req.user.id);
    const institute_name = currentUser?.institute_name ?? null;
    
    const allRecipients = await db.getRecipientsForComplaints();
    // Filter by institute (admin sees all)
    const recipients = req.user.role === "admin" 
      ? allRecipients 
      : allRecipients.filter(u => u.institute_name === institute_name);
    
    res.json({ recipients });
  });

  /** Complaints: any authenticated user except director may submit */
  router.post("/complaints", async (req, res) => {
    const body = req.body || {};
    const subject = body.subject ?? body.title;
    const details = body.details ?? body.message ?? body.body;
    const assigned_to = body.assigned_to;
    try {
      const complaint = await db.createComplaint({
        created_by: req.user.id,
        assigned_to,
        subject,
        details,
      });
      res.status(201).json({ complaint });
    } catch (e) {
      if (e?.code === "INVALID_COMPLAINT") {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error(e);
      res.status(500).json({ error: "Could not submit complaint" });
    }
  });

  /** Own complaints only — any authenticated role */
  router.get("/my-complaints", async (req, res) => {
    const complaints = await db.listComplaintsByUser(req.user.id);
    res.json({ complaints });
  });

  /** Complaints assigned to current user (director, principal, vice_principal, tech_staff) */
  router.get("/my-received-complaints", async (req, res) => {
    const complaints = await db.listComplaintsForUser(req.user.id);
    res.json({ complaints });
  });

  /** All complaints (director only, for backwards compatibility) */
  router.get("/complaints", requireRole(["director"]), async (req, res) => {
    const docs = await db.listComplaintsForUser(req.user.id);
    res.json({ complaints: docs });
  });

  router.patch("/complaints/:id/complete", requireRole(["director", "principal", "vice_principal", "tech_staff"]), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const existing = await db.getComplaintById(id);
    if (!existing) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (existing.assigned_to !== req.user.id && req.user.role !== "director") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const updated = await db.markComplaintResolved({
      complaintId: id,
      resolverUserId: req.user.id,
    });
    res.json({ complaint: updated });
  });

  router.put("/account", async (req, res) => {
    const { name, oldPassword, newPassword } = req.body || {};
    if (!oldPassword) {
      res.status(400).json({ error: "Old password is required" });
      return;
    }

    const current = await db.getUserById(req.user.id);
    if (!current) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    const ok = bcrypt.compareSync(String(oldPassword), current.password_hash);
    if (!ok) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    // Email is never updated via profile — identity is fixed (directors included).
    if (name === undefined && !newPassword) {
      res.status(400).json({ error: "No changes provided" });
      return;
    }

    let nextPasswordHash = undefined;
    if (newPassword) {
      nextPasswordHash = bcrypt.hashSync(String(newPassword), 10);
    }

    try {
      const updated = await db.updateUserAccount({
        id: current.id,
        name,
        password_hash: nextPasswordHash,
        password_plain: newPassword,
      });
      if (!updated) {
        res.status(404).json({ error: "Not found" });
        return;
      }

      const token = signToken({ user: updated, jwtSecret });
      res.json({
        token,
        user: { id: updated.id, email: updated.email, role: updated.role, name: updated.name ?? null },
      });
    } catch (e) {
      if (e?.code === "EMAIL_EXISTS") {
        res.status(409).json({ error: "Email already exists" });
        return;
      }
      res.status(500).json({ error: "Failed to update account" });
    }
  });

  router.put("/:id", requireRole(["director", "principal", "vice_principal"]), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    
    const currentUser = await db.getUserById(req.user.id);
    const institute_name = currentUser?.institute_name ?? null;

    const current = await db.getUserById(id);
    if (!current) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    
    // Check if user is in same institute (unless admin)
    if (req.user.role !== "admin" && current.institute_name !== institute_name) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    
    if (!canManageRole(req.user.role, current.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const body = req.body || {};
    const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : undefined;
    const roleRaw = body.role !== undefined ? body.role : body.Role;
    const { password, name, institute_name: newInstituteName } = body;
    const normalizedRole = roleRaw === undefined ? undefined : normalizeRole(roleRaw);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== undefined && !emailRegex.test(email)) {
      res.status(400).json({ error: "Invalid email address" });
      return;
    }
    if (roleRaw !== undefined && !normalizedRole) {
      res.status(400).json({
        error: "Invalid role.",
        allowedRoles: ASSIGNABLE_STAFF_ROLES,
        received: String(roleRaw),
      });
      return;
    }

    if (normalizedRole !== undefined && !canCreateRole(req.user.role, normalizedRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    if (email === undefined && normalizedRole === undefined && password === undefined && name === undefined && newInstituteName === undefined) {
      res.status(400).json({ error: "No changes provided" });
      return;
    }

    let nextPasswordHash = undefined;
    if (password !== undefined) {
      const raw = String(password);
      if (raw) nextPasswordHash = bcrypt.hashSync(raw, 10);
    }

    try {
      const updated = await db.updateAssignedUser({
        id,
        email,
        role: normalizedRole,
        password_hash: nextPasswordHash,
        password_plain: password ? String(password) : undefined,
        name,
        institute_name: newInstituteName,
      });
      if (!updated) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json({ user: updated });
    } catch (e) {
      if (e?.code === "EMAIL_EXISTS") {
        res.status(409).json({ error: "Email already exists" });
        return;
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  router.delete("/:id", requireRole(["director", "principal", "vice_principal"]), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    
    const currentUser = await db.getUserById(req.user.id);
    const institute_name = currentUser?.institute_name ?? null;

    const current = await db.getUserById(id);
    if (!current) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    
    // Check if user is in same institute (unless admin)
    if (req.user.role !== "admin" && current.institute_name !== institute_name) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    
    if (!canManageRole(req.user.role, current.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const ok = await db.deleteUserById(id);
    if (!ok) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.status(204).end();
  });

  return router;
}
