  import { Router } from "express";
import { db, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/subjects", requireAuth, async (_req, res) => {
  const rows = await db.select().from(subjectsTable);
  res.json(rows);
});

router.post("/subjects", requireAdmin, async (req, res) => {
  const { name, code } = req.body ?? {};
  const id = uuid();
  await db.insert(subjectsTable).values({
    id,
    name,
    code,
  } as any);
  res.status(201).json({ id, name, code });
});

router.put("/subjects/:id", requireAdmin, async (req, res) => {
  const { name, code } = req.body ?? {};
  await db
    .update(subjectsTable)
    .set({ name, code } as any)
    .where(eq(subjectsTable.id, String(req.params.id) as any));
  res.json({ ok: true });
});

router.delete("/subjects/:id", requireAdmin, async (req, res) => {
  await db
    .delete(subjectsTable)
    .where(eq(subjectsTable.id, String(req.params.id) as any));
  res.json({ ok: true });
});

export default router;
