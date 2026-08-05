import { Schema, model, Document } from "mongoose";

export interface ILecturer extends Document {
  username: string;
  password: string;
  name: string;
  surname: string;
  email: string;
}

const lecturerSchema = new Schema<ILecturer>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export const Lecturer = model<ILecturer>("Lecturer", lecturerSchema);
