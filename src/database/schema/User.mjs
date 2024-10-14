import { Schema } from "mongoose";

export const UserSchema = new Schema({
  username: {
    unique: true,
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ["OK", "Help", "Emergency", "Undefined"],
    default: "Undefined"
  }
});
