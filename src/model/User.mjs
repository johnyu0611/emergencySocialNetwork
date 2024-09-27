import { UserSchema } from "@/database/schema/User.mjs";
import { model } from "mongoose";

export const UserModal = new model("users", UserSchema);
