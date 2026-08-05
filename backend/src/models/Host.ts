import { Schema, model, Document } from "mongoose";

export interface IHost extends Document {
  name: string;
  country: string;
  city: string;
  email: string;
}

const hostSchema = new Schema<IHost>({
  name: { type: String, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  email: { type: String, required: true },
});

export const Host = model<IHost>("Host", hostSchema);
