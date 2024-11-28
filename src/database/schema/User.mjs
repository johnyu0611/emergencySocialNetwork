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
  timestamp: {
    type: Date
  },
  emergencyContact: {
    type: {
      username: {
        type: String
      },
      email: {
        type: String
      },
      fullName: {
        type: String
      }
    }
  },
  emergencyContactTo: {
    type: String
  },
  emergencyHistory: {
    type: [
      {
        sender: {
          type: String
        },
        timestamp: {
          type: Date,
          default: Date.now
        },
        content: {
          type: String
        }
      }
    ]
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
  },
  locationSharingSession: {
    type: {
      id: {
        type: String
      }
    },
    default: {
      id: "undefined"
    }
  }
});
