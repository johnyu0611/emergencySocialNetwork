import { Schema } from "mongoose";

export const QuizSchema = new Schema({
  questionID: {
    type: Number,
    required: true,
    unique: true,
    default: () => Math.floor(Math.random() * 100000)
  },
  creator: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  answer: {
    type: Boolean,
    required: true
  }
});
