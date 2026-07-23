import { Router } from "express";
import { db, classTestsTable, classTestResultsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/class-tests", requireAuth, async (_req, res) => {
  const tests = await db.select().from(classTestsTable).orderBy(classTestsTable.date);
  const results = await db.select().from(classTestResultsTable);
  const data = tests.map((t) => ({
    ...t,
    maxMarks: t.maxMarks,
    results: results.filter((r) => r.testId === t.id).map((r) => ({ rollNo: r.rollNo, name: r.name, marks: r.marks })),
  }));
  res.json(data);
});

router.post("/class-tests", requireAdmin, async (req, res) => {
  const { subject, date, maxMarks, results } = req.body ?? {};
  if (!subject || !date || !maxMarks) { res.status(400).json({ error: "subject, date, maxMarks required" }); return; }
  const id = uuid();
  await db.insert(classTestsTable).values({ id, subject, date, maxMarks: Number(maxMarks) });
  if (Array.isArray(results) && results.length > 0) {
    await db.insert(classTestResultsTable).values(
      results.map((r: { rollNo: number; name: string; marks: number }) => ({ id: uuid(), testId: id, rollNo: Number(r.rollNo), name: r.name, marks: Number(r.marks) }))
    );
  }
  const rows = await db.select().from(classTestResultsTable).where(eq(classTestResultsTable.testId, id));
  res.status(201).json({ id, subject, date, maxMarks: Number(maxMarks), results: rows.map((r) => ({ rollNo: r.rollNo, name: r.name, marks: r.marks })) });
});

router.delete("/class-tests/:id", requireAdmin, async (req, res) => {
  await db.delete(classTestsTable).where(eq(classTestsTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
