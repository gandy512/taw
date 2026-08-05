import { Schema, model, Document } from "mongoose";

export interface IStudent extends Document {
  username: string;
  password: string;
  name: string;
  surname: string;
  course: string;
  email: string;
}

const studentSchema = new Schema<IStudent>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  course: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

export const Student = model<IStudent>("Student", studentSchema);
