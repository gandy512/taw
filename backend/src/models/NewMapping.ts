import { Schema, model, Document, Types } from "mongoose";

export interface INewMapping extends Document {
  application: Types.ObjectId;
  module: Types.ObjectId;
}

const newMappingSchema = new Schema<INewMapping>({
  application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
  module: { type: Schema.Types.ObjectId, ref: "Module", required: true },
});

export const NewMapping = model<INewMapping>("NewMapping", newMappingSchema);
