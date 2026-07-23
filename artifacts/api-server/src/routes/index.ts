import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import studentsRouter from "./students";
import classTestsRouter from "./class-tests";
import subjectsRouter from "./subjects";
import softBoardRouter from "./soft-board";
import noticesRouter from "./notices";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(studentsRouter);
router.use(classTestsRouter);
router.use(subjectsRouter);
router.use(softBoardRouter);
router.use(noticesRouter);

export default router;
