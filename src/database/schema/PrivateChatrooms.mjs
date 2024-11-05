import { Schema } from "mongoose";

export const PrivateChatroomsSchema = new Schema({
  roomId: {
    unique: true,
    type: String,
    required: true
  },
  participants: {
    type: [String],
    default: []
  }
});
