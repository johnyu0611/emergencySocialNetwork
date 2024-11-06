import { Schema, model } from "mongoose";

export const StatusHistorySchema = new Schema({
  username: {
    type: String,
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
