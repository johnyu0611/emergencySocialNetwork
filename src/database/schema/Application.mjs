import { Schema } from "mongoose";

export const ApplicationSchema = new Schema({
  id: { type: String, required: true, unique: true }, // Unique application ID
  resourceId: { type: String, required: true }, // ID of the associated resource
  resourceName: { type: String, required: true }, // Resource name involved in the application
  amount: { type: Number, required: true }, // Amount requested/provided
  actionType: {
    type: String,
    enum: ["provide", "request"],
    required: true
  }, // Action type
  applicantUsername: { type: String, required: true }, // Username of the applicant
  resourceOwner: { type: String, required: true }, // Username of the resource owner
  createdAt: { type: Date, required: true, default: Date.now } // Timestamp of application creation
});
