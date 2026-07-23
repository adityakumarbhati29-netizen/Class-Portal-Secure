import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../middlewares/auth";
import { v4 as uuid } from "uuid";

const router = Router();

// GET /api/users  (admin only)
router.get("/users", requireAdmin, async (_req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map((u) => ({ id: u.id, username: u.username, role: u.role, name: u.name, password: u.password })));
});

// POST /api/users  (admin only)
router.post("/users", requireAdmin, async (req, res) => {
  const { username, password, role, name } = req.body ?? {};
  if (!username || !password || !name) {
    res.status(400).json({ error: "username, password, name required" }); return;
  }
  const count = await db.select().from(usersTable);
  if (count.length >= 55) { res.status(400).json({ error: "Maximum 55 users allowed" }); return; }

  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (existing.length > 0) { res.status(400).json({ error: "Username already exists" }); return; }

  const id = uuid();
  await db.insert(usersTable).values({ id, username, password, role: role ?? "student", name });
  res.status(201).json({ id, username, role: role ?? "student", name, password });
});

// DELETE /api/users/:id  (admin only)
router.delete("/users/:id", requireAdmin, async (req, res) => {
  if (req.params.id === req.authUser!.id) {
    res.status(400).json({ error: "Cannot delete yourself" }); return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
