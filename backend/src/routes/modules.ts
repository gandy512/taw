import { Router } from "express";
import { Module } from "../models/Module";

const router = Router();

router.get("/", async (_req, res) => {
  const modules = await Module.find();
  res.json(
    modules.map((module) => ({
      id: module._id.toString(),
      code: module.code,
      name: module.name,
      credits: module.credits,
      teacher_name: module.teacher_name,
      host: module.host ? module.host.toString() : null,
    }))
  );
});

export default router;
