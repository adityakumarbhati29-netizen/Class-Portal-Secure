import { Router } from "express";
import { db, subjectsTable, subjectTopicsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/subjects", requireAuth, async (_req, res) => {
  const subjects = await db.select().from(subjectsTable);
  const topics = await db.select().from(subjectTopicsTable);
  const data = subjects.map((s) => ({
    ...s,
    topics: topics.filter((t) => t.subjectId === s.id).map((t) => ({ id: t.id, title: t.title, description: t.description })),
  }));
  res.json(data);
});

router.post("/subjects", requireAdmin, async (req, res) => {
  const { name, teacher } = req.body ?? {};
  if (!name || !teacher) { res.status(400).json({ error: "name and teacher required" }); return; }
  const id = uuid();
  await db.insert(subjectsTable).values({ id, name, teacher });
  res.status(201).json({ id, name, teacher, topics: [] });
});

router.delete("/subjects/:id", requireAdmin, async (req, res) => {
  await db.delete(subjectsTable).where(eq(subjectsTable.id, req.params.id));
  res.json({ ok: true });
});

// Topics
router.post("/subjects/:id/topics", requireAdmin, async (req, res) => {
  const { title, description } = req.body ?? {};
  if (!title) { res.status(400).json({ error: "title required" }); return; }
  const id = uuid();
  await db.insert(subjectTopicsTable).values({ id, subjectId: req.params.id, title, description: description ?? "" });
  res.status(201).json({ id, title, description: description ?? "" });
});

router.delete("/subjects/:id/topics/:topicId", requireAdmin, async (req, res) => {
  await db.delete(subjectTopicsTable).where(eq(subjectTopicsTable.id, req.params.topicId));
  res.json({ ok: true });
});

export default router;
