import { Router } from "express";
import { db, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import { v4 as uuid } from "uuid";

const router = Router();

router.get("/students", requireAuth, async (_req, res) => {
  const rows = await db
    .select()
    .from(studentsTable)
    .orderBy(studentsTable.rollNo);
  res.json(rows);
});

router.post("/students", requireAdmin, async (req, res) => {
  const { rollNo, name, fatherName, contact, section } = req.body ?? {};
  if (!rollNo || !name) {
    res.status(400).json({ error: "rollNo and name required" });
    return;
  }
  const id = uuid();
  await db.insert(studentsTable).values({
    id,
    rollNo: Number(rollNo),
    name,
    fatherName: fatherName ?? "",
    contact: contact ?? "",
    section: section ?? "H",
  });
  res.status(201).json({
    id,
    rollNo: Number(rollNo),
    name,
    fatherName: fatherName ?? "",
    contact: contact ?? "",
    section: section ?? "H",
  });
});

router.put("/students/:id", requireAdmin, async (req, res) => {
  const { rollNo, name, fatherName, contact, section } = req.body ?? {};
  await db
    .update(studentsTable)
    .set({
      rollNo: Number(rollNo),
      name,
      fatherName,
      contact,
      section,
    })
    .where(eq(studentsTable.id, String(req.params.id)));
  res.json({ ok: true });
});

router.delete("/students/:id", requireAdmin, async (req, res) => {
  await db
    .delete(studentsTable)
    .where(eq(studentsTable.id, String(req.params.id)));
  res.json({ ok: true });
});

export default router;
