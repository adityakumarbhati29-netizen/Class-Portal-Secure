import { Router } from "express";
import { db, noticesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/notices", requireAuth, async (_req, res) => {
  const rows = await db.select().from(noticesTable);
  res.json(rows);
});

router.post("/notices", requireAdmin, async (req, res) => {
  const { title, content, date } = req.body ?? {};
  const id = uuid();
  await db.insert(noticesTable).values({
    id,
    title,
    content,
    date,
  } as any);
  res.status(201).json({ id, title, content, date });
});

router.put("/notices/:id", requireAdmin, async (req, res) => {
  const { title, content, date } = req.body ?? {};
  await db
    .update(noticesTable)
    .set({ title, content, date } as any)
    .where(eq(noticesTable.id, String(req.params.id) as any));
  res.json({ ok: true });
});

router.delete("/notices/:id", requireAdmin, async (req, res) => {
  await db
    .delete(noticesTable)
    .where(eq(noticesTable.id, String(req.params.id) as any));
  res.json({ ok: true });
});

export default router;
