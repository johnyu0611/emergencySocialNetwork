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
  status: {
    type: String,
    enum: ["online", "offline"],
    default: "online"
  }
});
