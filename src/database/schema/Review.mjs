import { Schema } from "mongoose";

export const ReviewSchema = new Schema({
  mcId: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  rate: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
});
