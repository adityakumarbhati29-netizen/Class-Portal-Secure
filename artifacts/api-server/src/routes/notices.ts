import { Router } from "express";
import { db, noticesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/notices", requireAuth, async (_req, res) => {
  const rows = await db.select().from(noticesTable).orderBy(desc(noticesTable.date));
  res.json(rows);
});

router.post("/notices", requireAdmin, async (req, res) => {
  const { title, content, date, author, priority } = req.body ?? {};
  if (!title || !content) { res.status(400).json({ error: "title and content required" }); return; }
  const id = uuid();
  await db.insert(noticesTable).values({ id, title, content, date: date ?? new Date().toISOString().split("T")[0], author: author ?? "Admin", priority: priority ?? "medium" });
  const [row] = await db.select().from(noticesTable).where(eq(noticesTable.id, id));
  res.status(201).json(row);
});

router.delete("/notices/:id", requireAdmin, async (req, res) => {
  await db.delete(noticesTable).where(eq(noticesTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
