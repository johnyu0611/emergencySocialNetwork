import { Schema } from "mongoose";
import Counter from "./Counter.mjs";

export const UserSchema = new Schema({
  userId: {
    type: Number
  },
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
        type: Number
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
    type: Number
  },
  emergencyHistory: {
    type: [
      {
        sender: {
          type: Number
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
          type: Number
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

UserSchema.pre("save", async function (next) {
  // eslint-disable-next-line no-invalid-this
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { name: "userId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      // eslint-disable-next-line no-invalid-this
      this.userId = counter.seq;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});
