import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin";
import { Student } from "../models/Student";
import { Lecturer } from "../models/Lecturer";
import { Host } from "../models/Host";
import { Module } from "../models/Module";
import { Application } from "../models/Application";
import {
  hostsSeed,
  lecturersSeed,
  studentsSeed,
  adminSeed,
  applicationsSeed,
  buildCfModules,
  buildHostModules,
} from "./data";

async function withHashedPassword<T extends { password: string }>(items: T[]): Promise<T[]> {
  return Promise.all(items.map(async (item) => ({ ...item, password: await bcrypt.hash(item.password, 10) })));
}

export async function seedDatabase(): Promise<void> {
  await mongoose.connection.dropDatabase();

  await Admin.create({ ...adminSeed, password: await bcrypt.hash(adminSeed.password, 10) });
  const insertedLecturers = await Lecturer.insertMany(await withHashedPassword(lecturersSeed));
  const insertedStudents = await Student.insertMany(await withHashedPassword(studentsSeed));

  const insertedHosts = await Host.insertMany(hostsSeed.map(({ prefix, ...host }) => host));
  const hostRefs = insertedHosts.map((host, index) => ({
    id: host._id.toString(),
    prefix: hostsSeed[index].prefix,
  }));

  await Module.insertMany(buildCfModules());
  await Module.insertMany(buildHostModules(hostRefs));

  await Application.insertMany(
    applicationsSeed.map((application) => ({
      student: insertedStudents[application.studentIdx]._id,
      lecturer: insertedLecturers[application.lecturerIdx]._id,
      host: insertedHosts[application.hostIdx]._id,
      year: application.year,
      semester: application.semester,
    }))
  );

  console.log("Database seeded.");
}
