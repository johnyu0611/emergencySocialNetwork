import { Schema } from "mongoose";

export const MessageSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  chatroomId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: function () {
      return this.chatroomId;
    }
  },
  status: {
    type: String,
    enum: ["OK", "Help", "Emergency", "Undefined"],
    default: "Undefined"
  },
  sender: {
    type: Number,
    required: true
  },
  receiver: {
    type: Number
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  readBy: {
    type: [Number]
  }
});
