import mongoose from "mongoose";

export const UserSchema = mongoose.model(
  "users",
  new mongoose.Schema({
    username: {
      unique: true,
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    }
  })
);
