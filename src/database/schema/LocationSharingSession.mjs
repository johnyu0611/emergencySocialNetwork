import { Schema } from "mongoose";

export const LocationSharingSessionSchema = new Schema({
  id: {
    unique: true,
    type: String,
    required: true
  },
  users: {
    type: [
      {
        userId: {
          type: Number,
          required: true
        },
        role: {
          type: String,
          required: true
        },
        location: {
          type: {
            longitude: Number,
            latitude: Number
          },
          required: true
        },
        lastSeen: {
          type: Number,
          required: true
        },
        resourceRequest: {
          type: [String],
          default: []
        },
        resourceResponse: {
          type: [String],
          default: []
        }
      }
    ],
    default: []
  }
});
