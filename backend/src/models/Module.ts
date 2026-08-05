import { Schema, model, Document, Types } from "mongoose";

// se host===null, è un esame di Ca' Foscari
export interface IModule extends Document {
  code: string;
  name: string;
  credits: number;
  teacher_name: string;
  host?: Types.ObjectId;
}

const moduleSchema = new Schema<IModule>({
  code: { type: String, required: true },
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  teacher_name: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, ref: "Host", required: false },
});

export const Module = model<IModule>("Module", moduleSchema);
