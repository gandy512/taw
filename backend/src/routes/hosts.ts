import { Router } from "express";
import { Host } from "../models/Host";

const router = Router();

router.get("/", async (_req, res) => {
  const hosts = await Host.find();
  res.json(
    hosts.map((host) => ({
      id: host._id.toString(),
      name: host.name,
      country: host.country,
      city: host.city,
      email: host.email,
    }))
  );
});

export default router;
