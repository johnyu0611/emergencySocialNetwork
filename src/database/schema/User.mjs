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
  },
  chatrooms: {
    type: [
      {
        id: {
          type: String
        },
        receiver: {
          type: String
        }
      }
    ],
    default: [
      {
        id: "00000000-0000-0000-0000-000000000000"
      }
    ]
  }
});
