import { Router } from "express";
import { db, softBoardPostsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/soft-board", requireAuth, async (_req, res) => {
  const rows = await db.select().from(softBoardPostsTable).orderBy(desc(softBoardPostsTable.pinned), desc(softBoardPostsTable.date));
  res.json(rows);
});

router.post("/soft-board", requireAdmin, async (req, res) => {
  const { title, content, date, author, pinned, colorIndex } = req.body ?? {};
  if (!title || !content) { res.status(400).json({ error: "title and content required" }); return; }
  const id = uuid();
  await db.insert(softBoardPostsTable).values({ id, title, content, date: date ?? new Date().toISOString().split("T")[0], author: author ?? "Admin", pinned: !!pinned, colorIndex: Number(colorIndex ?? 0) });
  const [row] = await db.select().from(softBoardPostsTable).where(eq(softBoardPostsTable.id, id));
  res.status(201).json(row);
});

router.put("/soft-board/:id", requireAdmin, async (req, res) => {
  const { title, content, date, author, pinned, colorIndex } = req.body ?? {};
  await db.update(softBoardPostsTable).set({ title, content, date, author, pinned: !!pinned, colorIndex: Number(colorIndex ?? 0) }).where(eq(softBoardPostsTable.id, req.params.id));
  res.json({ ok: true });
});

router.delete("/soft-board/:id", requireAdmin, async (req, res) => {
  await db.delete(softBoardPostsTable).where(eq(softBoardPostsTable.id, req.params.id));
  res.json({ ok: true });
});

export default router;
