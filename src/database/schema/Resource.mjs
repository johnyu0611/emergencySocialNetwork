import { Schema } from "mongoose";

export const ResourceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, optional: true },
  imageBase64: { type: String, optional: true },
  imageType: { type: String, optional: true },
  userId: { type: Number, required: true },
  resourceType: { type: String, required: true, enum: ["request", "provide"] }, // New field
  createdAt: { type: Date, required: true, default: Date.now }
});
