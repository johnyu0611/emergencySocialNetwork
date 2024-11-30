import { Schema } from "mongoose";

export const MedicalCenterSchema = new Schema({
  mcId: {
    type: String,
    unique: true,
    required: true
  },
  author: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  introduction: {
    type: String,
    required: true
  },
  location: {
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    },
    required: true
  },
  address: {
    type: String,
    required: true
  }
});
