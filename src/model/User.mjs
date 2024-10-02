import { UserSchema } from "@/database/schema/User.mjs";
import { model } from "mongoose";

export const UserModel = new model("users", UserSchema);
