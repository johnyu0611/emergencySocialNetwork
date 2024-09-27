import { UsernameSchema } from "@/controller/schema/Common.mjs";
import { z } from "zod";

export const AuthPayloadSchema = z.object({
  username: UsernameSchema
});
