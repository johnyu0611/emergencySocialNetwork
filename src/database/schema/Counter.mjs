import mongoose, { Schema } from "mongoose";

const counterSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true // Ensure unique counters for different uses
  },
  seq: {
    type: Number,
    default: 0 // Initial sequence number
  }
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
