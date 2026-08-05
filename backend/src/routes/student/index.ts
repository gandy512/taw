import { Router } from "express";
import applicationsRouter from "./applications";

const router = Router();

router.use("/applications", applicationsRouter);

export default router;
