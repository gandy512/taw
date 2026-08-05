import { Router } from "express";
import { Lecturer } from "../models/Lecturer";

const router = Router();

router.get("/", async (_req, res) => {
  const lecturers = await Lecturer.find();
  res.json(
    lecturers.map((lecturer) => ({
      id: lecturer._id.toString(),
      username: lecturer.username,
      name: lecturer.name,
      surname: lecturer.surname,
      email: lecturer.email,
    }))
  );
});

export default router;
