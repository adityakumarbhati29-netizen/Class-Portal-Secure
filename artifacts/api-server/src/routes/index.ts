// @ts-nocheck
import { Router } from "express";

import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import noticesRouter from "./notices.js";
import subjectsRouter from "./subjects.js";
import studentsRouter from "./students.js";
import softBoardRouter from "./soft-board.js";
import classTestsRouter from "./class-tests.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(noticesRouter);
router.use(subjectsRouter);
router.use(studentsRouter);
router.use(softBoardRouter);
router.use(classTestsRouter);

export default router;

