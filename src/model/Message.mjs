import { MessageSchema } from "@/database/schema/Message.mjs";
import mongoose from "mongoose";

export const MessageModel = mongoose.model("messages", MessageSchema);
