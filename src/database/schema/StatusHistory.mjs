import { Schema, model } from "mongoose";

export const StatusHistorySchema = new Schema({
  userId: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["OK", "Help", "Emergency"],
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  }
});

export const StatusHistory = model("StatusHistory", StatusHistorySchema);
