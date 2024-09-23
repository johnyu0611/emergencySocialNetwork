import { UsernameSchema } from "@/api/schema/Common.mjs";
import { z } from "zod";

export const AuthPayloadSchema = z.object({
  username: UsernameSchema
});
