import { Router } from "express";
import { db, softBoardPostsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/soft-board", requireAuth, async (_req, res) => {
  const rows = await db.select().from(softBoardPostsTable);
  res.json(rows);
});

router.post("/soft-board", requireAdmin, async (req, res) => {
  const { title, content, author, date } = req.body ?? {};
  const id = uuid();
  await db.insert(softBoardPostsTable).values({
    id,
    title,
    content,
    author,
    date,
  } as any);
  res.status(201).json({ id, title, content, author, date });
});

router.put("/soft-board/:id", requireAdmin, async (req, res) => {
  const { title, content, author, date } = req.body ?? {};
  await db
    .update(softBoardPostsTable)
    .set({ title, content, author, date } as any)
    .where(eq(softBoardPostsTable.id, String(req.params.id) as any));
  res.json({ ok: true });
});

router.delete("/soft-board/:id", requireAdmin, async (req, res) => {
  await db
    .delete(softBoardPostsTable)
    .where(eq(softBoardPostsTable.id, String(req.params.id) as any));
  res.json({ ok: true });
});

export default router;
