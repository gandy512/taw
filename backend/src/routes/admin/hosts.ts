import { Router } from "express";
import { Host } from "../../models/Host";

const router = Router();

router.post("/", async (req, res) => {
  const { name, country, city, email } = req.body ?? {};
  if (
    typeof name !== "string" ||
    typeof country !== "string" ||
    typeof city !== "string" ||
    typeof email !== "string"
  ) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const host = await Host.create({ name, country, city, email });
  res.status(201).json({
    id: host._id.toString(),
    name: host.name,
    country: host.country,
    city: host.city,
    email: host.email,
  });
});

export default router;
