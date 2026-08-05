import { Schema, model, Document, Types } from "mongoose";

export interface IMapping extends Document {
  application: Types.ObjectId;
  module: Types.ObjectId;
  grade?: number;
  grade_cf?: number;
  exam_date?: Date;
}

const mappingSchema = new Schema<IMapping>({
  application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
  module: { type: Schema.Types.ObjectId, ref: "Module", required: true },
  grade: { type: Number },
  grade_cf: { type: Number },
  exam_date: { type: Date },
});

export const Mapping = model<IMapping>("Mapping", mappingSchema);
