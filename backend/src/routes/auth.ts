import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin";
import { Student } from "../models/Student";
import { Lecturer } from "../models/Lecturer";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt";
import { AuthPayload, Role } from "../types/auth";
import { authenticate } from "../middleware/authenticate";

const router = Router();

const ROLES: Role[] = ["admin", "lecturer", "student"];

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as string[]).includes(value);
}

function findByUsername(role: Role, username: string) {
  switch (role) {
    case "admin":
      return Admin.findOne({ username });
    case "lecturer":
      return Lecturer.findOne({ username });
    case "student":
      return Student.findOne({ username });
  }
}

function findById(role: Role, id: string) {
  switch (role) {
    case "admin":
      return Admin.findById(id);
    case "lecturer":
      return Lecturer.findById(id);
    case "student":
      return Student.findById(id);
  }
}

router.post("/login", async (req, res) => {
  const { username, password, role } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string" || !isRole(role)) {
    res.status(400).json({ error: "Username, password and role are required" });
    return;
  }

  const user = await findByUsername(role, username);
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const payload: AuthPayload = { id: user._id.toString(), role, username: user.username };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({
    token,
    user: {
      id: user._id.toString(),
      role,
      username: user.username,
      name: user.name,
      surname: user.surname,
      email: user.email,
    },
  });
});

router.get("/me", authenticate, async (req, res) => {
  const { id, role } = req.user!;
  const user = await findById(role, id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user._id.toString(),
    role,
    username: user.username,
    name: user.name,
    surname: user.surname,
    email: user.email,
  });
});

export default router;
