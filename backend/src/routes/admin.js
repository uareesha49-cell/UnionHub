import express from "express";
import { requireAuth, requireRole } from "../auth.js";

export function createAdminRouter({ db, jwtSecret }) {
  const router = express.Router();

  // Get all users (admin only)
  router.get("/users", requireAuth({ jwtSecret }), requireRole(["admin"]), async (req, res) => {
    try {
      const users = await db.listAllUsers();
      res.json({ users });
    } catch (e) {
      console.error("Admin get users error:", e);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  // Get users by role (admin only)
  router.get("/users/:role", requireAuth({ jwtSecret }), requireRole(["admin"]), async (req, res) => {
    try {
      const { role } = req.params;
      const allUsers = await db.listAllUsers();
      const filteredUsers = allUsers.filter(user => user.role === role);
      res.json({ users: filteredUsers });
    } catch (e) {
      console.error("Admin get users by role error:", e);
      res.status(500).json({ error: "Failed to get users" });
    }
  });

  return router;
}
