import { Router } from "express";
import studentsRouter from "./students";
import lecturersRouter from "./lecturers";
import hostsRouter from "./hosts";
import applicationsRouter from "./applications";

const router = Router();

router.use("/students", studentsRouter);
router.use("/lecturers", lecturersRouter);
router.use("/hosts", hostsRouter);
router.use("/applications", applicationsRouter);

export default router;
