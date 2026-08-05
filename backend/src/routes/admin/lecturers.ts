import { Router } from "express";
import bcrypt from "bcryptjs";
import { Lecturer } from "../../models/Lecturer";

const router = Router();

router.post("/", async (req, res) => {
  const { username, password, name, surname, email } = req.body ?? {};
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    typeof surname !== "string" ||
    typeof email !== "string"
  ) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const lecturer = await Lecturer.create({ username, password: hashedPassword, name, surname, email });
    res.status(201).json({
      id: lecturer._id.toString(),
      username: lecturer.username,
      name: lecturer.name,
      surname: lecturer.surname,
      email: lecturer.email,
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      res.status(409).json({ error: "Username or email already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to create lecturer" });
  }
});

export default router;
