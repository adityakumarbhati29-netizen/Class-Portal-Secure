import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  const rows = await db.select().from(usersTable);
  res.json(rows);
});

router.put("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const { role } = req.body ?? {};
  await db
    .update(usersTable)
    .set({ role })
    .where(eq(usersTable.id, String(req.params.id)));
  res.json({ ok: true });
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  await db
    .delete(usersTable)
    .where(eq(usersTable.id, String(req.params.id)));
  res.json({ ok: true });
});

export default router;
