import { Schema, model, Document, Types } from "mongoose";

export type Decision = "acceptance" | "rejection";
export type Semester = "Winter" | "Summer" | "FullYear";
export type AdminStatus = "default" | "pre_departure_verified" | "canceled" | "terminated";

export interface IApplication extends Document {
  student: Types.ObjectId;
  host: Types.ObjectId;
  lecturer: Types.ObjectId;
  year: number;
  semester: Semester;
  start?: Date;
  finish?: Date;
  learning_agreement?: string;
  new_learning_agreement?: string;
  modification_reason?: string;
  transcript_of_records?: string;
  last_modification?: Date;
  last_decision?: Decision;
  last_decision_date?: Date;
  last_decision_reason?: string;
  last_modification_decision?: Decision;
  last_modification_decision_date?: Date;
  last_modification_decision_reason?: string;
  grades_approved_date?: Date;
  admin_status: AdminStatus;
}

const applicationSchema = new Schema<IApplication>({
  student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  host: { type: Schema.Types.ObjectId, ref: "Host", required: true },
  lecturer: { type: Schema.Types.ObjectId, ref: "Lecturer", required: true },
  year: { type: Number, required: true },
  semester: { type: String, enum: ["Winter", "Summer", "FullYear"], required: true },
  start: { type: Date, required: false },
  finish: { type: Date, required: false },
  learning_agreement: { type: String, required: false },
  new_learning_agreement: { type: String },
  modification_reason: { type: String },
  transcript_of_records: { type: String },
  last_modification: { type: Date },
  last_decision: { type: String, enum: ["acceptance", "rejection"] },
  last_decision_date: { type: Date },
  last_decision_reason: { type: String },
  last_modification_decision: { type: String, enum: ["acceptance", "rejection"] },
  last_modification_decision_date: { type: Date },
  last_modification_decision_reason: { type: String },
  grades_approved_date: { type: Date },
  admin_status: {
    type: String,
    enum: ["default", "pre_departure_verified", "canceled", "terminated"],
    required: true,
    default: "default",
  },
});

export const Application = model<IApplication>("Application", applicationSchema);
