import { Router } from "express";
import bcrypt from "bcryptjs";
import { Student } from "../../models/Student";

const router = Router();

router.get("/", async (_req, res) => {
  const students = await Student.find();
  res.json(
    students.map((student) => ({
      id: student._id.toString(),
      username: student.username,
      name: student.name,
      surname: student.surname,
      course: student.course,
      email: student.email,
    }))
  );
});

router.post("/", async (req, res) => {
  const { username, password, name, surname, course, email } = req.body ?? {};
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof name !== "string" ||
    typeof surname !== "string" ||
    typeof course !== "string" ||
    typeof email !== "string"
  ) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({ username, password: hashedPassword, name, surname, course, email });
    res.status(201).json({
      id: student._id.toString(),
      username: student.username,
      name: student.name,
      surname: student.surname,
      course: student.course,
      email: student.email,
    });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      res.status(409).json({ error: "Username or email already exists" });
      return;
    }
    res.status(500).json({ error: "Failed to create student" });
  }
});

export default router;
