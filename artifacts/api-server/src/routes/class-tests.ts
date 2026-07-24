import { Router } from "express";
import { db, classTestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/class-tests", requireAuth, async (_req, res) => {
  const rows = await db.select().from(classTestsTable);
  res.json(rows);
});

router.post("/class-tests", requireAdmin, async (req, res) => {
  const { title, date, totalMarks } = req.body ?? {};
  const [created] = await db
    .insert(classTestsTable)
    .values({
      title,
      date,
      totalMarks: Number(totalMarks),
    })
    .returning();
  res.status(201).json(created ?? { title, date, totalMarks: Number(totalMarks) });
});

router.put("/class-tests/:id", requireAdmin, async (req, res) => {
  const { title, date, totalMarks } = req.body ?? {};
  await db
    .update(classTestsTable)
    .set({ title, date, totalMarks: Number(totalMarks) })
    .where(eq(classTestsTable.id, String(req.params.id)));
  res.json({ ok: true });
});

router.delete("/class-tests/:id", requireAdmin, async (req, res) => {
  await db
    .delete(classTestsTable)
    .where(eq(classTestsTable.id, String(req.params.id)));
  res.json({ ok: true });
});

export default router;
